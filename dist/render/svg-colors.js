"use strict";
/**
 * Multi-colour + gradient recolouring for uploaded SVG icons.
 *
 * An uploaded SVG keeps its own colours by default. Each distinct colour it
 * uses is a "slot" (1st colour, 2nd colour, …) that a template designer can
 * repaint with a fixed colour, a theme token ({color.primary}) or a linear
 * gradient. Pure string work — runs the same on the server (SSR) and in the
 * browser — and the result still goes through the SVG sanitizer.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ICON_COLOR_SLOTS = void 0;
exports.inlineSvgStyles = inlineSvgStyles;
exports.svgColorSlots = svgColorSlots;
exports.recolorSvg = recolorSvg;
/** Most SVG icons use a handful of colours; more than this is an illustration. */
exports.MAX_ICON_COLOR_SLOTS = 12;
const PAINT_ATTRS = ["fill", "stroke", "stop-color"];
const NOT_A_COLOR = /^(none|transparent|currentcolor|inherit|initial|unset)$/i;
/** A theme token reference: {color.primary}. */
const TOKEN_RE = /^\{color\.([A-Za-z0-9_-]+)\}$/;
/** Plain colour literals we accept from the designer. */
const COLOR_LITERAL_RE = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([0-9.,%\s/+-]+\)|[a-z]{3,20})$/i;
function normColor(v) {
    let s = v.trim().toLowerCase();
    // #abc → #aabbcc so the same colour written two ways is one slot.
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(s);
    if (short)
        s = `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
    return s.replace(/\s+/g, "");
}
function isSlotColor(v) {
    if (!v)
        return false;
    const s = v.trim();
    return !!s && !NOT_A_COLOR.test(s) && !/^url\(/i.test(s) && !/^var\(/i.test(s);
}
/** A designer-entered colour → a safe CSS value, or null. */
function paintColor(c) {
    if (typeof c !== "string")
        return null;
    const s = c.trim();
    const token = TOKEN_RE.exec(s);
    if (token)
        return `var(--c-${token[1]})`;
    return COLOR_LITERAL_RE.test(s) ? s : null;
}
/**
 * Many exported SVGs (Illustrator, Figma) colour shapes through `style="…"`
 * or a `<style>` block with classes — both of which the sanitizer drops.
 * Move those fill/stroke/stop-color values onto plain attributes first so the
 * colours survive (and become recolourable slots).
 */
function inlineSvgStyles(svg) {
    if (typeof svg !== "string" || !svg)
        return "";
    let out = svg;
    // 1. `.cls-1{fill:#e94e1b}` rules from <style> blocks → per-class props.
    const classProps = new Map();
    out = out.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, css) => {
        const rule = /([^{}]+)\{([^{}]*)\}/g;
        let r;
        while ((r = rule.exec(css))) {
            const props = {};
            for (const decl of r[2].split(";")) {
                const [k, ...rest] = decl.split(":");
                const key = k?.trim().toLowerCase();
                const val = rest.join(":").trim();
                if (key && val && PAINT_ATTRS.includes(key))
                    props[key] = val;
            }
            if (!Object.keys(props).length)
                continue;
            for (const sel of r[1].split(",")) {
                const m = /^\s*\.([\w-]+)\s*$/.exec(sel);
                if (m)
                    classProps.set(m[1], { ...(classProps.get(m[1]) ?? {}), ...props });
            }
        }
        return "";
    });
    // 2. Each tag: class props, then its own style="" (wins), → attributes.
    out = out.replace(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?(\/?)>/g, (whole, tag, attrs = "", slash) => {
        if (!attrs)
            return whole;
        const props = {};
        const cls = /\sclass\s*=\s*["']([^"']*)["']/i.exec(attrs);
        if (cls)
            for (const c of cls[1].split(/\s+/))
                Object.assign(props, classProps.get(c) ?? {});
        const style = /\sstyle\s*=\s*["']([^"']*)["']/i.exec(attrs);
        if (style) {
            for (const decl of style[1].split(";")) {
                const [k, ...rest] = decl.split(":");
                const key = k?.trim().toLowerCase();
                const val = rest.join(":").trim();
                if (key && val && PAINT_ATTRS.includes(key))
                    props[key] = val;
            }
        }
        if (!Object.keys(props).length)
            return whole;
        let next = attrs;
        for (const [k, v] of Object.entries(props)) {
            const re = new RegExp(`\\s${k}\\s*=\\s*["'][^"']*["']`, "i");
            const safe = v.replace(/["<>]/g, "");
            next = re.test(next) ? next.replace(re, ` ${k}="${safe}"`) : `${next} ${k}="${safe}"`;
        }
        return `<${tag}${next}${slash}>`;
    });
    return out;
}
/** The distinct colours an SVG paints with, in first-use order (its slots). */
function svgColorSlots(svg) {
    const src = inlineSvgStyles(svg);
    const seen = [];
    const re = /\s(fill|stroke|stop-color)\s*=\s*["']([^"']*)["']/gi;
    let m;
    while ((m = re.exec(src))) {
        if (!isSlotColor(m[2]))
            continue;
        const c = normColor(m[2]);
        if (!seen.includes(c))
            seen.push(c);
        if (seen.length >= exports.MAX_ICON_COLOR_SLOTS)
            break;
    }
    return seen;
}
function gradientDef(id, paint) {
    const stops = (Array.isArray(paint.stops) ? paint.stops : [])
        .map((s) => ({ color: paintColor(s?.color), offset: s?.offset }))
        .filter((s) => !!s.color)
        .slice(0, 8);
    if (stops.length < 2)
        return null;
    const angle = Number.isFinite(paint.angle) ? Number(paint.angle) : 0;
    const stopTags = stops
        .map((s, i) => {
        const off = typeof s.offset === "number" && Number.isFinite(s.offset)
            ? Math.min(100, Math.max(0, s.offset))
            : (i / (stops.length - 1)) * 100;
        return `<stop offset="${off}%" stop-color="${s.color}"/>`;
    })
        .join("");
    // Rotate around the box centre so 0° = left→right, 90° = top→bottom.
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(${angle} 0.5 0.5)">${stopTags}</linearGradient>`;
}
/**
 * Repaint an SVG's colour slots. `paints[i]` replaces slot i (see
 * `svgColorSlots`); a missing/invalid paint keeps the original colour.
 * `uid` keeps gradient ids unique when one page shows many icons.
 */
function recolorSvg(svg, paints, uid = "i") {
    const src = inlineSvgStyles(svg);
    if (!Array.isArray(paints) || !paints.some(Boolean))
        return src;
    const slots = svgColorSlots(src);
    const safeUid = String(uid).replace(/[^\w-]/g, "") || "i";
    const replace = new Map();
    const defs = [];
    slots.forEach((slot, i) => {
        const paint = paints[i];
        if (!paint)
            return;
        if (typeof paint === "string") {
            const c = paintColor(paint);
            if (c)
                replace.set(slot, c);
            return;
        }
        if (paint && typeof paint === "object" && paint.kind === "linear") {
            const id = `tsg-${safeUid}-${i}`;
            const def = gradientDef(id, paint);
            if (def) {
                defs.push(def);
                replace.set(slot, `url(#${id})`);
            }
        }
    });
    if (!replace.size)
        return src;
    let out = src.replace(/(\s(fill|stroke|stop-color)\s*=\s*["'])([^"']*)(["'])/gi, (whole, pre, attr, val, post) => {
        if (!isSlotColor(val))
            return whole;
        const next = replace.get(normColor(val));
        if (!next)
            return whole;
        // A gradient can't paint a gradient stop — keep its first colour there.
        if (attr.toLowerCase() === "stop-color" && next.startsWith("url("))
            return whole;
        return `${pre}${next}${post}`;
    });
    if (defs.length) {
        out = out.replace(/<svg\b[^>]*>/i, (open) => `${open}<defs>${defs.join("")}</defs>`);
    }
    return out;
}
