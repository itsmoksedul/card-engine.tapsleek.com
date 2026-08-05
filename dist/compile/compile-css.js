"use strict";
/**
 * compileCss — TemplateDefinition → one immutable stylesheet.
 *
 * Runs once, on publish. The output is uploaded to R2 under a content hash and
 * served with `immutable` caching, so no request ever touches this code and no
 * CSS text is ever stored in the database.
 *
 * Cascade contract (relied on by the builder and the renderer):
 *   1. `@layer ts-reset`     — neutralise the host app's Preflight inside .ts-card
 *   2. `@layer ts-template`  — tokens, base rules, breakpoints, states
 *   3. `@layer ts-override`  — left empty here; the card's inline token
 * overrides are injected into it at render time
 *
 * Breakpoints are DESKTOP-FIRST. Within `ts-template`, source order is:
 * tokens → `base` (Desktop) → `md` (Tablet, `max-width`) → `sm` (Mobile,
 * `max-width`). Desktop is unconditional; each smaller breakpoint overrides it
 * below its threshold, and because the two override media queries share the same
 * specificity the narrower one (Mobile) must come LAST to win.
 * Interaction states carry an extra pseudo-class, so they outrank every
 * breakpoint rule by specificity and their position is irrelevant.
 *
 * `options.flattenTo` collapses the cascade for a SINGLE breakpoint into plain,
 * media-query-free rules — used by the in-page admin canvas so a Tablet/Mobile
 * override is visible on a wide desktop editor window (where a `max-width` query
 * would never match). It never touches the published artifact.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.len = exports.cssValue = void 0;
exports.compileCss = compileCss;
exports.compileTokenOverrides = compileTokenOverrides;
exports.compileCardTheme = compileCardTheme;
exports.collectNodeIds = collectNodeIds;
const style_1 = require("../types/style");
const definition_1 = require("../types/definition");
const node_1 = require("../types/node");
const resolve_design_1 = require("../blocks/resolve-design");
const registry_1 = require("../widgets/registry");
const declarations_1 = require("./declarations");
const value_1 = require("./value");
Object.defineProperty(exports, "cssValue", { enumerable: true, get: function () { return value_1.cssValue; } });
Object.defineProperty(exports, "len", { enumerable: true, get: function () { return value_1.len; } });
const color_utils_1 = require("./color-utils");
const DEFAULT_SCOPE = "ts-card";
function compileCss(def, options = {}) {
    const pretty = options.pretty ?? false;
    // Tolerate a caller passing a selector-style scope (".ts-card-abc"): the
    // compiler builds `.${scope}`, so a leading dot would produce an unmatchable
    // `..ts-card-abc`. Strip it so both `"ts-card"` and `".ts-card"` work.
    const scope = (options.scope ?? DEFAULT_SCOPE).replace(/^\.+/, "");
    const warnings = [];
    const emptyNodes = [];
    const base = [];
    const sm = [];
    const md = [];
    const states = [];
    const bucket = { base, sm, md };
    // ── 1. Tokens ──────────────────────────────────────────────────────────
    const tokenDecls = compileTokens(def, warnings);
    // ── 2. Card frame ──────────────────────────────────────────────────────
    const frameDecls = [];
    const width = Number.isFinite(def.meta?.canvasWidth)
        ? def.meta.canvasWidth
        : 450;
    frameDecls.push(["width", "100%"]);
    frameDecls.push([
        "max-width",
        `${Math.max(280, Math.min(1200, Math.round(width)))}px`,
    ]);
    frameDecls.push(["margin-inline", "auto"]);
    // The card frame carries the theme background token, so a card themes even
    // when its root node doesn't paint its own background. A root that DOES set a
    // background simply paints over this.
    frameDecls.push(["background-color", "var(--c-bg)"]);
    // ── 3. Node rules ──────────────────────────────────────────────────────
    for (const root of (0, definition_1.definitionRoots)(def)) {
        (0, node_1.walkTreeOrder)(root, (node) => {
            const cls = nodeClass(node.id, warnings);
            if (!cls)
                return;
            const sel = `.${scope} .${cls}`;
            let produced = 0;
            // base / sm / md
            for (const bp of ["base", "sm", "md"]) {
                const props = { ...mergeHidden(node.style?.[bp], node.hidden?.[bp]) };
                // Ensure root card container clips child elements cleanly when border-radius is set
                if (node.id === "root" && props.borderRadius && props.overflow === undefined) {
                    props.overflow = "hidden";
                }
                const decls = (0, declarations_1.declarationsFor)(props);
                if (decls.length) {
                    bucket[bp].push({ selector: sel, decls });
                    produced += decls.length;
                }
            }
            // interaction states
            for (const state of style_1.STATE_KEYS) {
                const decls = (0, declarations_1.declarationsFor)(node.style?.[state]);
                if (decls.length) {
                    states.push({ selector: `${sel}:${state}`, decls });
                    produced += decls.length;
                }
            }
            // activeStyle — emitted as `.p-<id>Active` for dynamic active state
            // e.g. the currently-selected carousel dot gets this class at runtime
            if ((0, node_1.isElement)(node) && node.activeStyle) {
                const activeId = `p-${node.id}Active`;
                produced += pushStyleSet(node.activeStyle, `.${scope} .${activeId}`, bucket, states);
            }
            if ((0, node_1.isWidget)(node)) {
                // Merge defaultPartStyles (from widget meta) with node.partStyles so
                // that widgets using the React render component (no layout tree) still
                // get their base styles compiled into CSS. node.partStyles overrides.
                const defaultParts = (0, registry_1.getWidgetMeta)(node.widget)?.defaultPartStyles ?? {};
                const mergedPartStyles = {};
                const allPartKeys = new Set([
                    ...Object.keys(defaultParts),
                    ...Object.keys(node.partStyles ?? {}),
                ]);
                for (const key of allPartKeys) {
                    mergedPartStyles[key] = {
                        ...defaultParts[key],
                        ...node.partStyles?.[key],
                    };
                }
                if (Object.keys(mergedPartStyles).length) {
                    produced += compilePartStyles(mergedPartStyles, sel, bucket, states, warnings);
                }
                const layout = node.layout ?? (0, registry_1.getWidgetMeta)(node.widget)?.defaultLayout;
                if (layout) {
                    (0, node_1.walkTreeOrder)(layout, (layoutNode) => {
                        const layoutCls = nodeClass(layoutNode.id, warnings);
                        if (!layoutCls)
                            return;
                        const layoutSel = `${sel} .${layoutCls}`;
                        for (const bp of ["base", "sm", "md"]) {
                            const props = mergeHidden(layoutNode.style?.[bp], layoutNode.hidden?.[bp]);
                            const decls = (0, declarations_1.declarationsFor)(props);
                            if (decls.length) {
                                bucket[bp].push({ selector: layoutSel, decls });
                                produced += decls.length;
                            }
                        }
                        for (const state of style_1.STATE_KEYS) {
                            const decls = (0, declarations_1.declarationsFor)(layoutNode.style?.[state]);
                            if (decls.length) {
                                states.push({ selector: `${layoutSel}:${state}`, decls });
                                produced += decls.length;
                            }
                        }
                        // activeStyle → emitted as .p-<id>Active
                        if (layoutNode.activeStyle) {
                            const activeSel = `.${scope} .p-${layoutNode.id}Active`;
                            produced += pushStyleSet(layoutNode.activeStyle, activeSel, bucket, states);
                        }
                    });
                }
            }
            // slot presets → same shape, keyed per allowed widget type
            if ((0, node_1.isSlot)(node) && node.presets) {
                for (const [type, preset] of Object.entries(node.presets)) {
                    if (!preset?.partStyles)
                        continue;
                    const scoped = `${sel} [data-widget="${cssSafeAttr(type)}"]`;
                    produced += compilePartStyles(preset.partStyles, scoped, bucket, states, warnings);
                }
            }
            if (produced === 0 && ((0, node_1.isElement)(node) ? node.tag !== "spacer" : true)) {
                emptyNodes.push(node.id);
            }
        });
    }
    // ── 3.5 Block presets (v2.1) ───────────────────────────────────────────
    // Per widget TYPE, so any block a user composes is styled by this template.
    if (options.emitBlockPresets) {
        const types = options.emitBlockPresets === "all"
            ? registry_1.WIDGET_TYPES
            : templateWidgetTypes(def);
        for (const type of types) {
            const { partStyles, layout, rootStyle, rootHidden } = (0, resolve_design_1.resolveBlockDesign)(def, type);
            const sel = `.${scope} .${(0, resolve_design_1.blockClass)(type)}`;
            if (partStyles && Object.keys(partStyles).length) {
                compilePartStyles(partStyles, sel, bucket, states, warnings);
            }
            if (rootStyle || rootHidden) {
                for (const bp of ["base", "sm", "md"]) {
                    const props = mergeHidden(rootStyle?.[bp], rootHidden?.[bp]);
                    const decls = (0, declarations_1.declarationsFor)(props);
                    if (decls.length)
                        bucket[bp].push({ selector: sel, decls });
                }
                for (const state of style_1.STATE_KEYS) {
                    const decls = (0, declarations_1.declarationsFor)(rootStyle?.[state]);
                    if (decls.length)
                        states.push({ selector: `${sel}:${state}`, decls });
                }
            }
            if (layout) {
                (0, node_1.walkTreeOrder)(layout, (layoutNode) => {
                    const layoutCls = nodeClass(layoutNode.id, warnings);
                    if (!layoutCls)
                        return;
                    const layoutSel = `${sel} .${layoutCls}`;
                    for (const bp of ["base", "sm", "md"]) {
                        const props = mergeHidden(layoutNode.style?.[bp], layoutNode.hidden?.[bp]);
                        const decls = (0, declarations_1.declarationsFor)(props);
                        if (decls.length)
                            bucket[bp].push({ selector: layoutSel, decls });
                    }
                    for (const state of style_1.STATE_KEYS) {
                        const decls = (0, declarations_1.declarationsFor)(layoutNode.style?.[state]);
                        if (decls.length)
                            states.push({ selector: `${layoutSel}:${state}`, decls });
                    }
                });
            }
        }
    }
    // ── 4. Popup chrome ────────────────────────────────────────────────────
    for (const popup of def.popups ?? []) {
        const key = cssSafeAttr(popup.key);
        const backdropSel = `.${scope} [data-popup-backdrop="${key}"]`;
        const panelSel = `.${scope} [data-popup-panel="${key}"]`;
        pushStyleSet(popup.backdrop, backdropSel, bucket, states);
        pushStyleSet(popup.panel, panelSel, bucket, states);
    }
    // ── 5. Assemble ────────────────────────────────────────────────────────
    const nl = pretty ? "\n" : "";
    const out = [];
    out.push(`@layer ts-reset, ts-template, ts-override;`);
    out.push(`@layer ts-reset{${resetCss(scope, pretty)}}`);
    const fonts = compileFonts(def, options, warnings);
    if (fonts.faces)
        out.push(fonts.faces);
    const body = [];
    body.push(rule(`.${scope}`, [...tokenDecls, ...frameDecls], pretty));
    // Desktop base — always unconditional, always first.
    body.push(...dedupe(base).map((r) => rule(r.selector, r.decls, pretty)));
    if (options.flattenTo) {
        // Preview mode: pour the applicable override layers straight into the
        // cascade with no media wrapper, Tablet before Mobile so the narrower wins.
        const active = options.flattenTo === "sm"
            ? ["md", "sm"]
            : options.flattenTo === "md"
                ? ["md"]
                : [];
        for (const bp of active) {
            body.push(...dedupe(bucket[bp]).map((r) => rule(r.selector, r.decls, pretty)));
        }
    }
    else {
        // Desktop-first cascade: Tablet (wider max-width) first, Mobile last.
        const mdCss = dedupe(md)
            .map((r) => rule(r.selector, r.decls, pretty))
            .join(nl);
        if (mdCss) {
            body.push(`@media ${style_1.BREAKPOINT_MEDIA.md}{${nl}${mdCss}${nl}}`);
            body.push(`@container ${style_1.BREAKPOINT_MEDIA.md}{${nl}${mdCss}${nl}}`);
        }
        const smCss = dedupe(sm)
            .map((r) => rule(r.selector, r.decls, pretty))
            .join(nl);
        if (smCss) {
            body.push(`@media ${style_1.BREAKPOINT_MEDIA.sm}{${nl}${smCss}${nl}}`);
            body.push(`@container ${style_1.BREAKPOINT_MEDIA.sm}{${nl}${smCss}${nl}}`);
        }
    }
    body.push(...dedupe(states).map((r) => rule(r.selector, r.decls, pretty)));
    out.push(`@layer ts-template{${nl}${body.filter(Boolean).join(nl)}${nl}}`);
    const css = out.filter(Boolean).join(nl);
    return {
        css,
        googleFontsHref: fonts.googleHref,
        emptyNodes,
        warnings,
        bytes: (0, value_1.utf8Bytes)(css),
    };
}
// ─── Pieces ──────────────────────────────────────────────────────────────────
const DEFAULT_TOKENS = {
    color: {
        primary: "#6366f1",
        surface: "#ffffff",
        bg: "#f8fafc",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        onPrimary: "#ffffff",
        link: "#3b5bfe",
        onLink: "#ffffff",
    },
    space: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
    },
    radius: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        full: "9999px",
    },
    font: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
    },
    size: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
    },
    shadow: {
        none: "none",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
};
/** Token table → CSS custom properties. Invalid literals are dropped + warned. */
function compileTokens(def, warnings) {
    const decls = [];
    const tokens = def.tokens ?? {};
    for (const group of definition_1.TOKEN_GROUPS) {
        const table = {
            ...DEFAULT_TOKENS[group],
            ...(tokens[group] ?? {}),
        };
        for (const [name, raw] of Object.entries(table)) {
            if (!value_1.IDENT_RE.test(name)) {
                warnings.push(`token ${group}.${name}: invalid name, dropped`);
                continue;
            }
            const value = validateTokenLiteral(group, raw);
            if (value === null) {
                warnings.push(`token ${group}.${name}: invalid value "${String(raw)}", dropped`);
                continue;
            }
            decls.push([`${definition_1.TOKEN_PREFIX[group]}${name}`, value]);
        }
    }
    return decls;
}
/**
 * Token literals are validated ONCE, here. Every use site is then just
 * `var(--x)`, which is why a token ref never needs per-property validation.
 */
function validateTokenLiteral(group, raw) {
    if (typeof raw !== "string" || raw.length > 200)
        return null;
    const v = raw.trim();
    switch (group) {
        case "color":
            return value_1.VALUE_RE.color.test(v) ? v : null;
        case "space":
        case "radius":
        case "size":
            return value_1.VALUE_RE.length.test(v) ? v : null;
        case "font":
            return value_1.VALUE_RE.fontFamily.test(v) ? v : null;
        case "shadow":
            // Shadow tokens are literal box-shadow values — tightly constrained.
            return /^[a-z0-9\s.,()#%/-]+$/i.test(v) && !/[;{}@\\]/.test(v) ? v : null;
        default:
            return null;
    }
}
function compilePartStyles(partStyles, parentSel, bucket, states, warnings) {
    let produced = 0;
    for (const [part, set] of Object.entries(partStyles)) {
        if (!value_1.IDENT_RE.test(part)) {
            warnings.push(`part "${part}": invalid name, dropped`);
            continue;
        }
        produced += pushStyleSet(set, `${parentSel} .p-${part}`, bucket, states);
    }
    return produced;
}
function pushStyleSet(set, selector, bucket, states) {
    if (!set)
        return 0;
    let produced = 0;
    for (const bp of ["base", "sm", "md"]) {
        const decls = (0, declarations_1.declarationsFor)(set[bp]);
        if (decls.length) {
            bucket[bp].push({ selector, decls });
            produced += decls.length;
        }
    }
    for (const state of style_1.STATE_KEYS) {
        const decls = (0, declarations_1.declarationsFor)(set[state]);
        if (decls.length) {
            states.push({ selector: `${selector}:${state}`, decls });
            produced += decls.length;
        }
    }
    return produced;
}
/** `hidden[bp] === true` folds into that breakpoint as `display:none`. */
function mergeHidden(props, hidden) {
    if (!hidden)
        return props;
    return { ...(props ?? {}), display: "none" };
}
/**
 * Merge rules whose declaration bodies are byte-identical into one selector
 * list. Renderer-transparent (no class map needed) and typically trims 15–30%
 * off a template that reuses spacing patterns.
 */
function dedupe(rules) {
    const byBody = new Map();
    const order = [];
    for (const r of rules) {
        if (!r.decls.length)
            continue;
        const body = (0, declarations_1.serializeDecls)(r.decls);
        let hit = byBody.get(body);
        if (!hit) {
            hit = { selectors: [], decls: r.decls };
            byBody.set(body, hit);
            order.push(body);
        }
        if (!hit.selectors.includes(r.selector))
            hit.selectors.push(r.selector);
    }
    return order.map((body) => {
        const hit = byBody.get(body);
        return { selector: hit.selectors.join(","), decls: hit.decls };
    });
}
function rule(selector, decls, pretty) {
    if (!decls.length)
        return "";
    return pretty
        ? `${selector} {\n${(0, declarations_1.serializeDecls)(decls, true)}\n}`
        : `${selector}{${(0, declarations_1.serializeDecls)(decls)}}`;
}
function nodeClass(id, warnings) {
    if (typeof id !== "string" || !value_1.IDENT_RE.test(id) || id.length > 64) {
        warnings.push(`node id "${String(id)}": invalid, skipped`);
        return null;
    }
    return `n${id}`;
}
function cssSafeAttr(v) {
    return String(v).replace(/[^A-Za-z0-9_-]/g, "");
}
/**
 * Minimal reset. The host apps run Tailwind Preflight, which would otherwise
 * strip margins and list styles the template relies on. Scoped so it can't
 * touch the surrounding page.
 */
function resetCss(scope, pretty) {
    const nl = pretty ? "\n" : "";
    const rules = [
        `.${scope} *,.${scope} *::before,.${scope} *::after{box-sizing:border-box}`,
        `.${scope}{-webkit-font-smoothing:antialiased;text-size-adjust:100%;color:var(--c-text, #0f172a)}`,
        `.${scope} img,.${scope} video{display:block;max-width:100%;height:auto}`,
        `.${scope} a{color:inherit;text-decoration:none}`,
        `.${scope} button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}`,
        `.${scope} p,.${scope} h1,.${scope} h2,.${scope} h3,.${scope} h4,.${scope} figure,.${scope} blockquote{margin:0}`,
        `.${scope} ul,.${scope} ol{margin:0;padding:0;list-style:none}`,
        `.${scope} svg{stroke-width:inherit}`,
    ];
    return rules.join(nl);
}
function compileFonts(def, options, warnings) {
    if (options.emitFonts === false || !def.fonts?.length) {
        return { faces: "", googleHref: null };
    }
    const faces = [];
    const googleFamilies = [];
    for (const font of def.fonts) {
        if (!font?.family || !value_1.VALUE_RE.fontFamily.test(font.family)) {
            warnings.push(`font "${String(font?.family)}": invalid family, skipped`);
            continue;
        }
        const weights = (font.weights ?? [400]).filter((w) => Number.isInteger(w) && w >= 100 && w <= 900);
        if (!weights.length)
            continue;
        if (font.source === "google") {
            googleFamilies.push(`family=${encodeURIComponent(font.family)}:wght@${weights.sort((a, b) => a - b).join(";")}`);
            continue;
        }
        const display = font.display ?? "swap";
        for (const weight of weights) {
            const file = font.files?.[String(weight)];
            const url = file ? (0, value_1.safeUrl)(joinUrl(options.fontBaseUrl, file)) : null;
            if (!url) {
                warnings.push(`font ${font.family}@${weight}: no valid self-hosted file, skipped`);
                continue;
            }
            faces.push(`@font-face{font-family:"${font.family}";font-style:${font.italic ? "italic" : "normal"};` +
                `font-weight:${weight};font-display:${display};src:url("${url}") format("woff2")}`);
        }
    }
    return {
        faces: faces.join(""),
        googleHref: googleFamilies.length
            ? `https://fonts.googleapis.com/css2?${googleFamilies.join("&")}&display=swap`
            : null,
    };
}
function joinUrl(base, path) {
    if (/^https:\/\//i.test(path))
        return path;
    if (!base)
        return path;
    return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}
// ─── Render-time override sheet (tiny, inline, NOT part of the artifact) ─────
/**
 * A Pro user's token overrides, scoped to one card. Emitted inline at render
 * time in the `ts-override` layer, so it wins over the template without the
 * template's artifact ever changing — which is what keeps the CDN object
 * immutable and shared across every card on the template.
 */
function compileTokenOverrides(overrides, cardScopeClass, allow) {
    if (!overrides || !value_1.IDENT_RE.test(cardScopeClass))
        return "";
    const allowSet = allow?.length ? new Set(allow) : null;
    const decls = [];
    for (const group of definition_1.TOKEN_GROUPS) {
        const table = overrides[group];
        if (!table || typeof table !== "object")
            continue;
        for (const [name, raw] of Object.entries(table)) {
            if (!value_1.IDENT_RE.test(name))
                continue;
            // Only colour overrides are gated by `allowTokenOverride`.
            if (group === "color" && allowSet && !allowSet.has(name))
                continue;
            const value = validateTokenLiteral(group, raw);
            if (value === null)
                continue;
            decls.push(`${definition_1.TOKEN_PREFIX[group]}${name}:${value}`);
        }
    }
    if (!decls.length)
        return "";
    return `@layer ts-override{${overrideScope(cardScopeClass)}{${decls.join(";")}}}`;
}
/**
 * Selector list a per-card override must target.
 *
 * `CardRenderer` renders its own inner `.ts-card` wrapper INSIDE the host's
 * scoped `.${cardScopeClass}` element. The template sheet defines the token
 * defaults on `.ts-card` (`@layer ts-template`), so that inner `.ts-card`
 * re-declares every token as its OWN value — which shadows the inherited
 * override coming from the outer scoped element, and the card's descendants
 * (buttons, text) inherit the DEFAULT instead of the override. Targeting both
 * the scoped element AND any nested `.ts-card` inside it puts the override on
 * that inner holder too (still in `ts-override`, so it wins over the template),
 * so the whole subtree resolves to the overridden tokens.
 */
function overrideScope(cardScopeClass) {
    return `.${cardScopeClass},.${cardScopeClass} .ts-card`;
}
/**
 * A neutral muted colour (a grey), pulled from the resolved text colour toward
 * pure black/white — never toward the theme colour, so secondary text never
 * takes on a colour tint.
 */
function neutralMuted(textHex) {
    const t = (0, color_utils_1.parseColor)(textHex);
    if (!t)
        return textHex;
    const isLightText = (t.r + t.g + t.b) / 3 > 140;
    const toward = isLightText
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };
    return (0, color_utils_1.rgbString)((0, color_utils_1.mix)(t, toward, 0.4));
}
/**
 * v2.1 — a card owner's global Theme → inline override, scoped to the card.
 *
 * Maps the user-facing knobs onto the template's design tokens, so the whole
 * card recolours/retypes/re-spaces without the immutable template artifact
 * changing. Emitted in the `ts-override` layer at render time, exactly like
 * `compileTokenOverrides`. `fontWeight` and `layout` are applied at render (a
 * root class), not here.
 */
function compileCardTheme(theme, cardScopeClass) {
    if (!theme || !value_1.IDENT_RE.test(cardScopeClass))
        return "";
    const decls = [];
    // ── Derive a full, readable token set from the two user knobs ──────────
    // The ThemeEditor exposes only "Card Theme" (background) and "Button Color"
    // (primary). Everything else — text, muted, border, surface, on-primary — is
    // derived here so the card is always legible, then any explicit override the
    // user set still wins.
    const rawColors = { ...(theme.colors ?? {}) };
    // "Match Button to Card Theme": the button (primary) follows the Card Theme
    // colour instead of its own Button Colour. The three knobs — Card Theme
    // (background), Button Colour (primary) and Link Colour — are otherwise
    // completely independent tokens.
    const matchButton = rawColors.matchButton === true;
    const themeRaw = rawColors.bg ?? rawColors.theme;
    const accentRaw = matchButton
        ? themeRaw
        : (rawColors.primary ?? rawColors.primaryAccent);
    const linkRaw = rawColors.link;
    // Popl-style ratios: the card BACKGROUND is a light tint of the Card Theme
    // colour (soft pastel), while buttons/accents stay the FULL saturated colour.
    const BG_TINT = 0.2; // card background = theme @ 20% over white
    const SURFACE_TINT = 0.12; // panels/rows slightly lighter
    const BORDER_TINT = 0.32; // subtle themed border
    const derived = {};
    // Button pattern: FULL solid button colour, auto-contrasted label.
    const accent = (0, color_utils_1.parseColor)(accentRaw);
    if (accent) {
        const solid = (0, color_utils_1.blendOverWhite)(accent);
        derived.primary = (0, color_utils_1.rgbString)(solid);
        derived.onPrimary = (0, color_utils_1.contrastText)(solid);
    }
    // Card background pattern: a soft tint of the Card Theme colour so the card
    // reads as a pastel of the brand, not a full fill. Text/muted are ALWAYS
    // neutral (dark or light) — never the theme colour — so copy stays legible.
    const themeColor = (0, color_utils_1.parseColor)(themeRaw);
    if (themeColor) {
        const solid = (0, color_utils_1.blendOverWhite)(themeColor);
        // SOLID (opaque) pale tints — blended over white, not rgba — so nested
        // themed layers (frame + root + rows) never stack into a saturated fill.
        const bgSolid = (0, color_utils_1.blendOverWhite)({ ...solid, a: BG_TINT });
        derived.bg = (0, color_utils_1.rgbString)(bgSolid);
        derived.surface = (0, color_utils_1.rgbString)((0, color_utils_1.blendOverWhite)({ ...solid, a: SURFACE_TINT }));
        derived.border = (0, color_utils_1.rgbString)((0, color_utils_1.blendOverWhite)({ ...solid, a: BORDER_TINT }));
        const text = (0, color_utils_1.contrastText)(bgSolid);
        derived.text = text;
        derived.muted = neutralMuted(text);
    }
    // Link pattern: independent link colour, with a paired on-colour for when the
    // link colour is painted as a background (icon chips, pills).
    const link = (0, color_utils_1.parseColor)(linkRaw);
    if (link) {
        const solid = (0, color_utils_1.blendOverWhite)(link);
        derived.link = (0, color_utils_1.rgbString)(solid);
        derived.onLink = (0, color_utils_1.contrastText)(solid);
    }
    // Explicit overrides win (e.g. a manual "Text color"). Skip the input aliases
    // (consumed above, not tokens) and the boolean toggle.
    const SKIP = new Set(["primaryAccent", "theme", "matchLink", "matchButton"]);
    const finalColors = { ...derived };
    for (const [name, raw] of Object.entries(rawColors)) {
        if (SKIP.has(name) || !value_1.IDENT_RE.test(name))
            continue;
        const v = validateTokenLiteral("color", raw);
        if (v !== null)
            finalColors[name] = v;
    }
    for (const [name, raw] of Object.entries(finalColors)) {
        const v = validateTokenLiteral("color", raw);
        if (v !== null)
            decls.push(`${definition_1.TOKEN_PREFIX.color}${name}:${v}`);
    }
    if (theme.fontFamily) {
        const v = validateTokenLiteral("font", theme.fontFamily);
        if (v !== null)
            decls.push(`${definition_1.TOKEN_PREFIX.font}heading:${v}`, `${definition_1.TOKEN_PREFIX.font}body:${v}`);
    }
    if (theme.radius != null) {
        const v = validateTokenLiteral("radius", `${theme.radius}px`);
        if (v !== null)
            for (const key of ["sm", "md", "lg"])
                decls.push(`${definition_1.TOKEN_PREFIX.radius}${key}:${v}`);
    }
    if (theme.density != null) {
        const v = validateTokenLiteral("space", `${theme.density}px`);
        if (v !== null)
            decls.push(`${definition_1.TOKEN_PREFIX.space}4:${v}`);
    }
    if (!decls.length)
        return "";
    return `@layer ts-override{${overrideScope(cardScopeClass)}{${decls.join(";")}}}`;
}
/** Distinct widget types placed in the template tree, in first-seen order. */
function templateWidgetTypes(def) {
    const seen = new Set();
    for (const root of (0, definition_1.definitionRoots)(def)) {
        (0, node_1.walkTreeOrder)(root, (n) => {
            if ((0, node_1.isWidget)(n))
                seen.add(n.widget);
        });
    }
    return [...seen];
}
/** Nodes referenced by the tree, for lint + dead-CSS detection. */
function collectNodeIds(def) {
    const ids = [];
    for (const root of (0, definition_1.definitionRoots)(def)) {
        (0, node_1.walkTreeOrder)(root, (n) => ids.push(n.id));
    }
    return ids;
}
