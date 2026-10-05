"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_IFRAME_DOMAINS = void 0;
exports.safeHref = safeHref;
exports.sanitizeHtml = sanitizeHtml;
// Allowlist HTML sanitizer for @tapsleek/card-engine.
//
// Why not DOMPurify: on the server it ran on linkedom, which lacks
// `document.implementation.createHTMLDocument`. DOMPurify then reports itself
// unsupported and `sanitize()` returns its input UNCHANGED — every SSR'd card
// (s1 previews, public pages) shipped raw user HTML.
//
// This sanitizer never trusts a DOM: it tokenizes with htmlparser2 (pure JS,
// edge-safe, runs identically in the browser and on the server) and REBUILDS
// the output from an allowlist, escaping every text node and attribute value.
// Because the output is generated, not filtered, there is no parser-differential
// (mXSS) gap: the browser re-parses only simple, allowlisted, escaped markup.
// Same code on both sides also means server and client output match.
const htmlparser2_1 = require("htmlparser2");
const VOID = new Set(["br", "hr", "img", "wbr"]);
/** Dropped together with everything inside them. */
const DROP_WITH_CONTENT = new Set([
    "script", "style", "template", "noscript", "noembed", "noframes", "xmp",
    "textarea", "title", "iframe", "object", "embed", "applet", "math",
    "select", "option", "frameset", "frame", "plaintext", "foreignobject",
]);
const RICH_TAGS = [
    "p", "br", "hr", "div", "span", "strong", "b", "em", "i", "u", "s", "strike",
    "del", "ins", "mark", "small", "sub", "sup", "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre", "img",
    "figure", "figcaption", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
];
const SVG_TAGS = [
    "svg", "g", "path", "circle", "ellipse", "line", "polyline", "polygon",
    "rect", "defs", "lineargradient", "radialgradient", "stop", "clippath",
    "mask", "title", "desc",
];
/** htmlparser2 lowercases tag names; SVG needs its camelCase back. */
const SVG_CASE = {
    lineargradient: "linearGradient",
    radialgradient: "radialGradient",
    clippath: "clipPath",
};
const RICH_ATTRS = {
    "*": ["title", "dir", "lang"],
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
    ol: ["start", "reversed"],
};
const SVG_ATTRS = [
    "viewbox", "xmlns", "width", "height", "fill", "stroke", "stroke-width",
    "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray",
    "stroke-dashoffset", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1",
    "x2", "y2", "points", "transform", "opacity", "fill-opacity",
    "stroke-opacity", "fill-rule", "clip-rule", "offset", "stop-color",
    "stop-opacity", "id", "gradientunits", "gradienttransform", "clip-path",
    "mask", "preserveaspectratio", "class", "aria-hidden", "role", "focusable",
];
const SVG_ATTR_CASE = {
    viewbox: "viewBox",
    gradientunits: "gradientUnits",
    gradienttransform: "gradientTransform",
    preserveaspectratio: "preserveAspectRatio",
};
exports.ALLOWED_IFRAME_DOMAINS = [
    "youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com",
    "vimeo.com", "player.vimeo.com",
    "google.com", "www.google.com", "maps.google.com",
    "calendly.com",
    "typeform.com", "formspree.io",
    "spotify.com", "open.spotify.com",
    "soundcloud.com", "w.soundcloud.com",
    "apple.com", "embed.music.apple.com",
];
const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms";
const IFRAME_ALLOW = new Set([
    "autoplay", "clipboard-write", "encrypted-media", "fullscreen", "picture-in-picture",
]);
function escapeText(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s) {
    return escapeText(s).replace(/"/g, "&quot;");
}
/** Links: http(s), mailto, tel, sms, in-page and relative paths only. */
function safeHref(value) {
    if (typeof value !== "string")
        return null;
    // Browsers ignore control chars / whitespace inside schemes ("java\tscript:").
    const v = value.trim();
    const probe = v.replace(/[\u0000- ]/g, "").toLowerCase();
    if (!probe)
        return null;
    if (/^(https?:|mailto:|tel:|sms:)/.test(probe))
        return v;
    if (probe.startsWith("//"))
        return null; // protocol-relative → open redirect
    if (/^[/#?]/.test(probe))
        return v;
    if (/^[a-z][a-z0-9+.-]*:/.test(probe))
        return null; // javascript:, data:, vbscript:, …
    return v; // bare relative path
}
/** Images and iframes: https only. */
function safeSrc(value) {
    const v = value.trim();
    return /^https:\/\/[^\s"'<>]+$/i.test(v) ? v : null;
}
function iframeAttrs(attribs) {
    const src = safeSrc(attribs.src ?? "");
    if (!src)
        return null;
    let host = "";
    try {
        host = new URL(src).hostname;
    }
    catch {
        return null;
    }
    if (!exports.ALLOWED_IFRAME_DOMAINS.includes(host))
        return null;
    const out = [`src="${escapeAttr(src)}"`, `sandbox="${IFRAME_SANDBOX}"`];
    const allow = (attribs.allow ?? "")
        .split(";")
        .map((s) => s.trim())
        .filter((s) => IFRAME_ALLOW.has(s));
    if (allow.length)
        out.push(`allow="${allow.join("; ")}"`);
    for (const key of ["width", "height", "title", "loading", "frameborder"]) {
        const v = attribs[key];
        if (v !== undefined && /^[\w .%-]{0,100}$/.test(v))
            out.push(`${key}="${escapeAttr(v)}"`);
    }
    if ("allowfullscreen" in attribs)
        out.push("allowfullscreen");
    out.push('referrerpolicy="strict-origin-when-cross-origin"');
    return out.join(" ");
}
function htmlAttrs(tag, attribs) {
    const allowed = new Set([...(RICH_ATTRS["*"] ?? []), ...(RICH_ATTRS[tag] ?? [])]);
    const out = [];
    for (const [rawKey, rawValue] of Object.entries(attribs)) {
        const key = rawKey.toLowerCase();
        if (!allowed.has(key))
            continue;
        let value = rawValue;
        if (key === "href")
            value = safeHref(rawValue);
        else if (key === "src")
            value = safeSrc(rawValue);
        else if (key === "target")
            value = rawValue === "_blank" ? "_blank" : null;
        else if (key === "rel")
            continue; // forced below for _blank
        if (value === null)
            continue;
        out.push(`${key}="${escapeAttr(value)}"`);
    }
    if (tag === "a" && attribs.target === "_blank")
        out.push('rel="noopener noreferrer"');
    return out.join(" ");
}
function svgAttrs(attribs) {
    const out = [];
    for (const [rawKey, value] of Object.entries(attribs)) {
        const key = rawKey.toLowerCase();
        if (!SVG_ATTRS.includes(key))
            continue;
        // Only same-document references: url(#id). No external fetches, no js.
        if (/url\s*\(/i.test(value) && !/^\s*url\(\s*#[\w-]+\s*\)\s*$/i.test(value))
            continue;
        if (/javascript:|expression\s*\(/i.test(value))
            continue;
        out.push(`${SVG_ATTR_CASE[key] ?? key}="${escapeAttr(value)}"`);
    }
    return out.join(" ");
}
const POLICY_TAGS = {
    richtext: new Set(RICH_TAGS),
    embed: new Set([...RICH_TAGS, "iframe"]),
    svg: new Set(SVG_TAGS),
};
/**
 * Rebuild `html` keeping only what `policy` allows. Unknown tags are unwrapped
 * (their text survives), dangerous ones are dropped with their content, and
 * every opened tag is closed so the result is always well-formed.
 */
function sanitizeHtml(html, policy = "richtext") {
    if (typeof html !== "string" || !html)
        return "";
    const tags = POLICY_TAGS[policy];
    const out = [];
    const open = [];
    let dropDepth = 0;
    const parser = new htmlparser2_1.Parser({
        onopentag(name, attribs) {
            const tag = name.toLowerCase();
            if (dropDepth > 0) {
                if (!VOID.has(tag))
                    dropDepth++;
                return;
            }
            if (tag === "iframe" && tags.has("iframe")) {
                const attrs = iframeAttrs(attribs);
                if (attrs)
                    out.push(`<iframe ${attrs}></iframe>`);
                dropDepth = 1; // iframe children are never rendered
                return;
            }
            if (DROP_WITH_CONTENT.has(tag) && !(policy === "svg" && tag === "title")) {
                if (!VOID.has(tag))
                    dropDepth = 1;
                return;
            }
            if (!tags.has(tag))
                return; // unwrap: keep children, drop the tag
            const attrs = policy === "svg" ? svgAttrs(attribs) : htmlAttrs(tag, attribs);
            const outTag = SVG_CASE[tag] ?? tag;
            out.push(`<${outTag}${attrs ? ` ${attrs}` : ""}>`);
            if (!VOID.has(tag))
                open.push(tag);
        },
        ontext(text) {
            if (dropDepth === 0)
                out.push(escapeText(text));
        },
        onclosetag(name) {
            const tag = name.toLowerCase();
            if (dropDepth > 0) {
                if (!VOID.has(tag))
                    dropDepth--;
                return;
            }
            if (VOID.has(tag) || !tags.has(tag))
                return;
            const at = open.lastIndexOf(tag);
            if (at === -1)
                return;
            while (open.length > at) {
                const t = open.pop();
                out.push(`</${SVG_CASE[t] ?? t}>`);
            }
        },
    }, {
        decodeEntities: true,
        lowerCaseTags: true,
        lowerCaseAttributeNames: false,
        recognizeSelfClosing: true,
    });
    parser.write(html);
    parser.end();
    while (open.length) {
        const t = open.pop();
        out.push(`</${SVG_CASE[t] ?? t}>`);
    }
    return out.join("");
}
