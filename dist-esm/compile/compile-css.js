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
import { blockClass, resolveBlockDesign } from "../blocks/resolve-design";
import { definitionRoots, TOKEN_GROUPS, TOKEN_PREFIX, } from "../types/definition";
import { collectWidgets, isElement, isSlot, isWidget, walkTreeOrder, walkTreeWithLayouts, } from "../types/node";
import { isSystemFont } from "../catalog/fonts";
import { BREAKPOINT_MEDIA, STATE_KEYS, stateSelector, } from "../types/style";
import { getWidgetMeta, WIDGET_TYPES } from "../widgets/registry";
import { CAROUSEL_PART_COUNTERPARTS } from "../widgets/carousel-parts";
import { mix, parseColor, rgbString } from "./color-utils";
import { declarationsFor, serializeDecls } from "./declarations";
import { cssValue, IDENT_RE, len, safeUrl, utf8Bytes, VALUE_RE } from "./value";
const DEFAULT_SCOPE = "ts-card";
export function compileCss(def, options = {}) {
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
    // The root node carries the theme background token instead of the frame
    // to ensure border-radius and overflow clipping works correctly.
    // ── 3. Node rules ──────────────────────────────────────────────────────
    for (const root of definitionRoots(def)) {
        walkTreeOrder(root, function compileNode(node) {
            const cls = nodeClass(node.id, warnings);
            if (!cls)
                return;
            const isCardRoot = node === root && root === def.root;
            const sel = isCardRoot ? `.${scope} > .${cls}` : `.${scope} .${cls}`;
            let produced = 0;
            // base / sm / md
            for (const bp of ["base", "sm", "md"]) {
                const props = { ...mergeHidden(node.style?.[bp], node.hidden?.[bp]) };
                if (isCardRoot) {
                    if (props.borderRadius && props.overflow === undefined) {
                        props.overflow = "hidden";
                    }
                    if (bp === "base" && !props.background) {
                        props.background = "var(--c-bg)";
                    }
                }
                const decls = declarationsFor(props);
                if (decls.length) {
                    bucket[bp].push({ selector: sel, decls });
                    produced += decls.length;
                }
            }
            // interaction states
            for (const state of STATE_KEYS) {
                const decls = declarationsFor(node.style?.[state]);
                if (decls.length) {
                    states.push({ selector: stateSelector(sel, state), decls });
                    produced += decls.length;
                }
            }
            // activeStyle — emitted as `.p-<id>Active` for dynamic active state
            // e.g. the currently-selected carousel dot gets this class at runtime
            if (isElement(node) && node.activeStyle) {
                const activeId = `p-${node.id}Active`;
                produced += pushStyleSet(node.activeStyle, `.${scope} .${activeId}`, bucket, states);
            }
            if (isWidget(node)) {
                // Merge defaultPartStyles (from widget meta) with node.partStyles so
                // that widgets using the React render component (no layout tree) still
                // get their base styles compiled into CSS. node.partStyles overrides.
                const defaultParts = getWidgetMeta(node.widget)?.defaultPartStyles ?? {};
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
                const layout = node.layout ?? getWidgetMeta(node.widget)?.defaultLayout;
                if (Object.keys(mergedPartStyles).length) {
                    produced += compilePartStyles(mergedPartStyles, sel, bucket, states, warnings, layout ? (layout.id || "root") : "root");
                }
                if (layout) {
                    walkTreeOrder(layout, (layoutNode) => {
                        // A widget nested in this layout has a globally unique id and its
                        // own layout/part styles — compile it as a full node, not a leaf.
                        if (layoutNode !== layout && isWidget(layoutNode)) {
                            compileNode(layoutNode);
                            return;
                        }
                        const layoutCls = nodeClass(layoutNode.id, warnings);
                        if (!layoutCls)
                            return;
                        const layoutPart = layoutCls.replace(/^n/, "");
                        const counterparts = CAROUSEL_PART_COUNTERPARTS[layoutPart] || [];
                        const allSelectors = [
                            layoutNode === layout ? sel : `${sel} .${layoutCls}`,
                            ...counterparts.map((cp) => `${sel} .n${cp}`),
                        ];
                        const layoutSel = allSelectors.join(", ");
                        for (const bp of ["base", "sm", "md"]) {
                            const props = mergeHidden(layoutNode.style?.[bp], layoutNode.hidden?.[bp]);
                            const decls = declarationsFor(props);
                            if (decls.length) {
                                bucket[bp].push({ selector: layoutSel, decls });
                                produced += decls.length;
                            }
                        }
                        for (const state of STATE_KEYS) {
                            const decls = declarationsFor(layoutNode.style?.[state]);
                            if (decls.length) {
                                states.push({ selector: stateSelector(layoutSel, state), decls });
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
            if (isSlot(node) && node.presets) {
                for (const [type, preset] of Object.entries(node.presets)) {
                    if (!preset?.partStyles)
                        continue;
                    const scoped = `${sel} [data-widget="${cssSafeAttr(type)}"]`;
                    produced += compilePartStyles(preset.partStyles, scoped, bucket, states, warnings);
                }
            }
            if (produced === 0 && (isElement(node) ? node.tag !== "spacer" : true)) {
                emptyNodes.push(node.id);
            }
        });
    }
    // ── 3.5 Block presets (v2.1) ───────────────────────────────────────────
    // Per widget TYPE, so any block a user composes is styled by this template.
    if (options.emitBlockPresets) {
        // "all" = every registry type PLUS every type the template places: a
        // template can carry a widget this engine build doesn't know yet (newer
        // admin, older app), and its blocks must still get the template's styles.
        const types = options.emitBlockPresets === "all"
            ? [...new Set([...WIDGET_TYPES, ...templateWidgetTypes(def)])]
            : templateWidgetTypes(def);
        for (const type of types) {
            const { partStyles, layout, rootStyle, rootHidden } = resolveBlockDesign(def, type);
            const sel = `.${scope} .${blockClass(type)}`;
            bucket["base"].push({
                selector: sel,
                decls: [
                    ["width", "100%"],
                    ["box-sizing", "border-box"],
                ],
            });
            if (partStyles && Object.keys(partStyles).length) {
                compilePartStyles(partStyles, sel, bucket, states, warnings, layout ? (layout.id || "root") : "root");
            }
            if (rootStyle || rootHidden) {
                for (const bp of ["base", "sm", "md"]) {
                    const props = mergeHidden(rootStyle?.[bp], rootHidden?.[bp]);
                    const decls = declarationsFor(props);
                    const hasLayoutDisplay = Boolean(layout?.style?.[bp]?.display && layout.style[bp]?.display !== "block");
                    const filteredDecls = hasLayoutDisplay
                        ? decls.filter(([p]) => p !== "display")
                        : decls;
                    if (filteredDecls.length)
                        bucket[bp].push({ selector: sel, decls: filteredDecls });
                }
                for (const state of STATE_KEYS) {
                    const decls = declarationsFor(rootStyle?.[state]);
                    if (decls.length)
                        states.push({ selector: stateSelector(sel, state), decls });
                }
            }
            if (layout) {
                walkTreeOrder(layout, (layoutNode) => {
                    const layoutCls = nodeClass(layoutNode.id, warnings);
                    if (!layoutCls)
                        return;
                    const layoutPart = layoutCls.replace(/^n/, "");
                    const counterparts = CAROUSEL_PART_COUNTERPARTS[layoutPart] || [];
                    const allSelectors = [
                        layoutNode === layout
                            ? `${sel}, ${sel}.${layoutCls}`
                            : `${sel} .p-${layoutPart}, ${sel} .${layoutCls}`,
                        ...counterparts.flatMap((cp) => [`${sel} .p-${cp}`, `${sel} .n${cp}`]),
                    ];
                    const layoutSel = allSelectors.join(", ");
                    for (const bp of ["base", "sm", "md"]) {
                        const props = mergeHidden(layoutNode.style?.[bp], layoutNode.hidden?.[bp]);
                        const decls = declarationsFor(props);
                        if (decls.length)
                            bucket[bp].push({ selector: layoutSel, decls });
                    }
                    for (const state of STATE_KEYS) {
                        const decls = declarationsFor(layoutNode.style?.[state]);
                        if (decls.length)
                            states.push({ selector: stateSelector(layoutSel, state), decls });
                    }
                });
            }
        }
        // ── 3.6 Custom template blocks (v2.2) ──────────────────────────────────
        // Custom blocks authored from Layer Groups in Admin.
        for (const customBlock of def.customBlocks ?? []) {
            const sel = `.${scope} .${blockClass(customBlock.id)}`;
            bucket["base"].push({
                selector: sel,
                decls: [
                    ["width", "100%"],
                    ["box-sizing", "border-box"],
                ],
            });
            if (customBlock.layout) {
                walkTreeOrder(customBlock.layout, (layoutNode) => {
                    const layoutCls = nodeClass(layoutNode.id, warnings);
                    if (!layoutCls)
                        return;
                    const layoutPart = layoutCls.replace(/^n/, "");
                    const layoutSel = layoutNode === customBlock.layout
                        ? sel
                        : `${sel} .p-${layoutPart}, ${sel} .${layoutCls}`;
                    for (const bp of ["base", "sm", "md"]) {
                        const props = mergeHidden(layoutNode.style?.[bp], layoutNode.hidden?.[bp]);
                        const decls = declarationsFor(props);
                        if (decls.length)
                            bucket[bp].push({ selector: layoutSel, decls });
                    }
                    for (const state of STATE_KEYS) {
                        const decls = declarationsFor(layoutNode.style?.[state]);
                        if (decls.length)
                            states.push({ selector: stateSelector(layoutSel, state), decls });
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
        // Viewport media queries only. A card is never wider than its ~450px
        // canvas, so container queries on it matched on every screen and forced
        // the Tablet/Mobile design onto desktop browsers too.
        const mdCss = dedupe(md)
            .map((r) => rule(r.selector, r.decls, pretty))
            .join(nl);
        if (mdCss) {
            body.push(`@media ${BREAKPOINT_MEDIA.md}{${nl}${mdCss}${nl}}`);
        }
        const smCss = dedupe(sm)
            .map((r) => rule(r.selector, r.decls, pretty))
            .join(nl);
        if (smCss) {
            body.push(`@media ${BREAKPOINT_MEDIA.sm}{${nl}${smCss}${nl}}`);
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
        bytes: utf8Bytes(css),
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
    for (const group of TOKEN_GROUPS) {
        const table = {
            ...DEFAULT_TOKENS[group],
            ...(tokens[group] ?? {}),
        };
        for (const [name, raw] of Object.entries(table)) {
            if (!IDENT_RE.test(name)) {
                warnings.push(`token ${group}.${name}: invalid name, dropped`);
                continue;
            }
            const value = validateTokenLiteral(group, raw);
            if (value === null) {
                warnings.push(`token ${group}.${name}: invalid value "${String(raw)}", dropped`);
                continue;
            }
            decls.push([`${TOKEN_PREFIX[group]}${name}`, value]);
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
            return VALUE_RE.color.test(v) ? v : null;
        case "space":
        case "radius":
        case "size":
            return VALUE_RE.length.test(v) ? v : null;
        case "font":
            return VALUE_RE.fontFamily.test(v) ? v : null;
        case "shadow":
            // Shadow tokens are literal box-shadow values — tightly constrained.
            return /^[a-z0-9\s.,()#%/-]+$/i.test(v) && !/[;{}@\\]/.test(v) ? v : null;
        default:
            return null;
    }
}
function compilePartStyles(partStyles, parentSel, bucket, states, warnings, rootPartKey) {
    let produced = 0;
    for (const [part, set] of Object.entries(partStyles)) {
        if (!IDENT_RE.test(part)) {
            warnings.push(`part "${part}": invalid name, dropped`);
            continue;
        }
        const counterparts = CAROUSEL_PART_COUNTERPARTS[part] || [];
        const allParts = [part, ...counterparts];
        const selectors = allParts.map((p) => rootPartKey && p === rootPartKey
            ? `${parentSel}, ${parentSel} .p-${p}`
            : `${parentSel} .p-${p}`);
        const partSel = selectors.join(", ");
        produced += pushStyleSet(set, partSel, bucket, states);
    }
    return produced;
}
function pushStyleSet(set, selector, bucket, states) {
    if (!set)
        return 0;
    let produced = 0;
    for (const bp of ["base", "sm", "md"]) {
        const decls = declarationsFor(set[bp]);
        if (decls.length) {
            bucket[bp].push({ selector, decls });
            produced += decls.length;
        }
    }
    for (const state of STATE_KEYS) {
        const decls = declarationsFor(set[state]);
        if (decls.length) {
            const stateSel = stateSelector(selector, state);
            states.push({ selector: stateSel, decls });
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
        const body = serializeDecls(r.decls);
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
        ? `${selector} {\n${serializeDecls(decls, true)}\n}`
        : `${selector}{${serializeDecls(decls)}}`;
}
function nodeClass(id, warnings) {
    if (typeof id !== "string" || !IDENT_RE.test(id) || id.length > 64) {
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
    if (options.emitFonts === false) {
        return { faces: "", googleHref: null };
    }
    const faces = [];
    const googleFamilies = new Map();
    const addGoogleFamily = (family, weights = [400, 500, 600, 700]) => {
        if (!family || typeof family !== "string")
            return;
        const clean = family.trim().replace(/^['"]|['"]$/g, "");
        if (!clean ||
            isSystemFont(clean) ||
            clean.startsWith("{") ||
            !VALUE_RE.fontFamily.test(clean)) {
            return;
        }
        const current = googleFamilies.get(clean) ?? new Set();
        for (const w of weights) {
            if (Number.isInteger(w) && w >= 100 && w <= 900) {
                current.add(w);
            }
        }
        if (current.size === 0) {
            [400, 500, 600, 700].forEach((w) => current.add(w));
        }
        googleFamilies.set(clean, current);
    };
    const selfHostedFamilies = new Set();
    // 1. Process explicit def.fonts
    if (Array.isArray(def.fonts)) {
        for (const font of def.fonts) {
            if (!font?.family || !VALUE_RE.fontFamily.test(font.family)) {
                warnings.push(`font "${String(font?.family)}": invalid family, skipped`);
                continue;
            }
            const weights = (font.weights ?? [400]).filter((w) => Number.isInteger(w) && w >= 100 && w <= 900);
            if (!weights.length)
                continue;
            if (font.source === "google") {
                addGoogleFamily(font.family, weights);
                continue;
            }
            selfHostedFamilies.add(font.family.trim().toLowerCase());
            const display = font.display ?? "swap";
            for (const weight of weights) {
                const file = font.files?.[String(weight)];
                const url = file ? safeUrl(joinUrl(options.fontBaseUrl, file)) : null;
                if (!url) {
                    warnings.push(`font ${font.family}@${weight}: no valid self-hosted file, skipped`);
                    continue;
                }
                faces.push(`@font-face{font-family:"${font.family}";font-style:${font.italic ? "italic" : "normal"};` +
                    `font-weight:${weight};font-display:${display};src:url("${url}") format("woff2")}`);
            }
        }
    }
    // 2. Discover fonts from tokens (e.g. def.tokens.font.body, def.tokens.font.heading)
    const fontTokens = (def.tokens?.font ?? {});
    for (const fontVal of Object.values(fontTokens)) {
        if (typeof fontVal === "string" &&
            !selfHostedFamilies.has(fontVal.trim().toLowerCase())) {
            addGoogleFamily(fontVal);
        }
    }
    // 3. Discover fonts from element and widget part styles in the AST
    const resolveTokenFamily = (val) => {
        if (val.startsWith("{font.") && val.endsWith("}")) {
            const tokenName = val.slice(6, -1);
            return fontTokens[tokenName] || val;
        }
        return val;
    };
    const checkStyle = (style) => {
        if (!style)
            return;
        if (typeof style.fontFamily === "string") {
            const resolved = resolveTokenFamily(style.fontFamily);
            const firstFont = resolved
                .split(",")[0]
                .trim()
                .replace(/^['"]|['"]$/g, "");
            if (firstFont && !selfHostedFamilies.has(firstFont.toLowerCase())) {
                const weight = typeof style.fontWeight === "number" ? style.fontWeight : 400;
                addGoogleFamily(firstFont, [weight, 400, 500, 600, 700]);
            }
        }
    };
    try {
        for (const root of definitionRoots(def)) {
            walkTreeWithLayouts(root, (node) => {
                if (node.style) {
                    checkStyle(node.style.base);
                    checkStyle(node.style.md);
                    checkStyle(node.style.sm);
                }
                if (node.kind === "widget" && node.partStyles) {
                    for (const ps of Object.values(node.partStyles)) {
                        if (ps) {
                            checkStyle(ps.base);
                            checkStyle(ps.md);
                            checkStyle(ps.sm);
                        }
                    }
                }
            });
        }
    }
    catch {
        // Graceful fallback if tree walk fails on partial AST
    }
    const googleFamiliesList = [];
    for (const [family, weightsSet] of googleFamilies.entries()) {
        const sorted = Array.from(weightsSet).sort((a, b) => a - b);
        googleFamiliesList.push(`family=${encodeURIComponent(family)}:wght@${sorted.join(";")}`);
    }
    return {
        faces: faces.join(""),
        googleHref: googleFamiliesList.length
            ? `https://fonts.googleapis.com/css2?${googleFamiliesList.join("&")}&display=swap`
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
export function compileTokenOverrides(overrides, cardScopeClass, allow) {
    if (!overrides || !IDENT_RE.test(cardScopeClass))
        return "";
    const allowSet = allow?.length ? new Set(allow) : null;
    const decls = [];
    for (const group of TOKEN_GROUPS) {
        const table = overrides[group];
        if (!table || typeof table !== "object")
            continue;
        for (const [name, raw] of Object.entries(table)) {
            if (!IDENT_RE.test(name))
                continue;
            // Only colour overrides are gated by `allowTokenOverride`.
            if (group === "color" && allowSet && !allowSet.has(name))
                continue;
            const value = validateTokenLiteral(group, raw);
            if (value === null)
                continue;
            decls.push(`${TOKEN_PREFIX[group]}${name}:${value}`);
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
    const t = parseColor(textHex);
    if (!t)
        return textHex;
    const isLightText = (t.r + t.g + t.b) / 3 > 140;
    const toward = isLightText
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };
    return rgbString(mix(t, toward, 0.4));
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
export function compileCardTheme(theme, cardScopeClass) {
    if (!theme || !IDENT_RE.test(cardScopeClass))
        return "";
    const decls = [];
    // Directly map explicit color overrides (bg, primary, text, border, etc.)
    // without any automatic ratio or tinting derivation.
    const rawColors = { ...(theme.colors ?? {}) };
    const SKIP = new Set(["matchButton", "primaryAccent", "theme", "matchLink"]);
    for (const [name, raw] of Object.entries(rawColors)) {
        if (SKIP.has(name) || !IDENT_RE.test(name))
            continue;
        const v = validateTokenLiteral("color", raw);
        if (v !== null)
            decls.push(`${TOKEN_PREFIX.color}${name}:${v}`);
    }
    if (!rawColors.primary && rawColors.primaryAccent) {
        const v = validateTokenLiteral("color", rawColors.primaryAccent);
        if (v !== null)
            decls.push(`${TOKEN_PREFIX.color}primary:${v}`);
    }
    const fontFamily = theme.typography?.fontFamily || theme.fontFamily;
    if (fontFamily) {
        // If it's just a word like "Oswald", make it a valid font family string like "'Oswald', sans-serif"
        // Wait, the renderer uses `--f-body: 'Oswald', sans-serif`. validateTokenLiteral might reject just "Oswald"
        // wait, `validateTokenLiteral("font", "Oswald")` checks VALUE_RE.fontFamily.
        // If it's valid, we push it. But it needs the fallback for safety.
        const safeValue = fontFamily.includes(",") ? fontFamily : `'${fontFamily}', sans-serif`;
        const v = validateTokenLiteral("font", safeValue);
        if (v !== null)
            decls.push(`${TOKEN_PREFIX.font}heading:${v}`, `${TOKEN_PREFIX.font}body:${v}`);
    }
    if (theme.radius != null) {
        const v = validateTokenLiteral("radius", `${theme.radius}px`);
        if (v !== null)
            for (const key of ["sm", "md", "lg"])
                decls.push(`${TOKEN_PREFIX.radius}${key}:${v}`);
    }
    if (theme.density != null) {
        const v = validateTokenLiteral("space", `${theme.density}px`);
        if (v !== null)
            decls.push(`${TOKEN_PREFIX.space}4:${v}`);
    }
    if (!decls.length)
        return "";
    return `@layer ts-override{${overrideScope(cardScopeClass)}{${decls.join(";")}}}`;
}
/** Distinct widget types placed in the template tree, in first-seen order. */
function templateWidgetTypes(def) {
    const seen = new Set();
    for (const root of definitionRoots(def)) {
        for (const w of collectWidgets(root))
            seen.add(w.widget);
    }
    return [...seen];
}
/** Nodes referenced by the tree, for lint + dead-CSS detection. */
export function collectNodeIds(def) {
    const ids = [];
    for (const root of definitionRoots(def)) {
        walkTreeOrder(root, (n) => ids.push(n.id));
    }
    return ids;
}
export { cssValue, len };
