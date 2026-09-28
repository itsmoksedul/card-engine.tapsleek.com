"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarouselContext = void 0;
exports.NodeRenderer = NodeRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const embla_carousel_autoplay_1 = __importDefault(require("embla-carousel-autoplay"));
const embla_carousel_react_1 = __importDefault(require("embla-carousel-react"));
const purify_1 = __importStar(require("./purify"));
const react_1 = __importDefault(require("react"));
const widgets_1 = require("../widgets");
const resolveBinding_1 = require("./resolveBinding");
const widgets_2 = require("./widgets");
const icon_helper_1 = require("./widgets/icon-helper");
function NodeRenderer({ node, content, ctx }) {
    if (node.kind === "element")
        return (0, jsx_runtime_1.jsx)(ElementRenderer, { node: node, content: content, ctx: ctx });
    if (node.kind === "widget")
        return (0, jsx_runtime_1.jsx)(WidgetRenderer, { node: node, content: content, ctx: ctx });
    if (node.kind === "slot")
        return (0, jsx_runtime_1.jsx)(SlotRenderer, { node: node, content: content, ctx: ctx });
    return null;
}
exports.CarouselContext = react_1.default.createContext(null);
function CarouselProvider({ node, content, ctx, dom }) {
    const align = content?._design?.carouselAlign ?? "start";
    const loop = content?._design?.carouselLoop === true;
    const autoplay = content?._design?.carouselAutoplay === true;
    const autoplayDelay = Number(content?._design?.carouselAutoplayDelay) || 3000;
    const plugins = react_1.default.useMemo(() => {
        return [
            (0, embla_carousel_autoplay_1.default)({
                delay: autoplayDelay,
                stopOnInteraction: true,
                active: autoplay,
            }),
        ];
    }, [autoplay, autoplayDelay]);
    const [emblaRef, emblaApi] = (0, embla_carousel_react_1.default)({ loop, align, containScroll: false }, plugins);
    const [selectedIndex, setSelectedIndex] = react_1.default.useState(0);
    react_1.default.useEffect(() => {
        if (!emblaApi)
            return;
        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };
        emblaApi.on("select", onSelect);
        onSelect();
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);
    react_1.default.useEffect(() => {
        if (emblaApi) {
            emblaApi.reInit({ loop, align, containScroll: false }, plugins);
            const autoplayPlugin = emblaApi.plugins().autoplay;
            if (autoplayPlugin) {
                if (autoplay) {
                    autoplayPlugin.play();
                }
                else {
                    autoplayPlugin.stop();
                }
            }
        }
    }, [emblaApi, align, loop, plugins, autoplay]);
    const kids = (node.children ?? []).map((child) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: child, content: content, ctx: ctx }, child.id)));
    return ((0, jsx_runtime_1.jsx)(exports.CarouselContext.Provider, { value: { emblaApi, emblaRef, selectedIndex }, children: (0, jsx_runtime_1.jsx)("div", { ...dom, children: kids }) }));
}
// ─── Elements ────────────────────────────────────────────────────────────────
const TAG_MAP = {
    frame: "div",
    stack: "div",
    grid: "div",
    text: "p",
    richtext: "div",
    image: "img",
    icon: "span",
    button: "button",
    link: "a",
    divider: "hr",
    spacer: "div",
    embed: "div",
    video: "div",
    carousel: "div",
    "carousel-root": "div",
};
/** HTML void elements — must never be given children or React 19 hard-errors. */
const VOID_DOM_TAGS = new Set(["img", "hr", "br", "input", "wbr"]);
/**
 * Props that configure the ENGINE, not the DOM.
 *
 * These must never reach an HTML element: React forwards unknown attributes
 * verbatim, so spreading `node.props` produced `<p text="…">` and
 * `<img fit="cover">` — invalid HTML plus a console warning per node.
 */
const ENGINE_PROPS = new Set([
    "text",
    "html",
    "level",
    "as",
    "fit",
    "ratio",
    "action",
    "popup",
    "label",
    "name",
    "size",
    "icon",
    "loading",
    "url",
    "controls",
    "autoplay",
    "loop",
]);
function ElementRenderer({ node, content, ctx, }) {
    const ctxEmbla = react_1.default.useContext(exports.CarouselContext);
    if (node.visibleIf) {
        const { key, equals } = node.visibleIf;
        const val = content?._design?.[key] ?? ctx.selfData?.[key];
        const isVisible = val === equals || (equals === false && !val);
        if (!isVisible)
            return null;
    }
    if (node.repeat) {
        const items = (0, resolveBinding_1.resolveBinding)(node.repeat, ctx.card, content, ctx.selfData);
        if (!Array.isArray(items))
            return null;
        return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: items.map((item, index) => ((0, jsx_runtime_1.jsx)(ElementRenderer, { node: { ...node, repeat: undefined }, content: content, ctx: { ...ctx, selfData: item, repeatIndex: index } }, item.id ?? index))) }));
    }
    const bound = (0, resolveBinding_1.resolveBinding)(node.bind, ctx.card, content, ctx.selfData);
    const props = (node.props ?? {});
    // A bound node that resolves empty disappears entirely — that's what stops an
    // absent bio leaving a gap in the layout.
    if (node.hideIfEmpty && isEmpty(bound))
        return null;
    const tag = node.tag === "frame"
        ? props.as || "div"
        : node.tag === "heading"
            ? `h${clampLevel(props.level)}`
            : TAG_MAP[node.tag] || "div";
    let isCarouselDotActive = false;
    if (props.action === "carousel-dot" &&
        ctxEmbla?.selectedIndex === ctx.repeatIndex) {
        isCarouselDotActive = true;
    }
    const customClass = typeof props.className === 'string' && props.className.trim() ? ` ${props.className}` : "";
    const dom = {
        className: `n${node.id} p-${node.id}${isCarouselDotActive ? " p-carouselDotActive" : ""}${customClass}`,
    };
    // Only forward attributes the DOM actually understands.
    for (const [key, value] of Object.entries(props)) {
        if (ENGINE_PROPS.has(key) || key === "className")
            continue;
        dom[key] = value;
    }
    if (ctx.isEditing)
        dom["data-node-id"] = node.id;
    if (node.a11y?.role)
        dom.role = node.a11y.role;
    if (node.a11y?.label)
        dom["aria-label"] = node.a11y.label;
    let children = null;
    switch (node.tag) {
        case "carousel-root": {
            return ((0, jsx_runtime_1.jsx)(CarouselProvider, { node: node, content: content, ctx: ctx, dom: dom }));
        }
        case "carousel": {
            const perView = Number(content?._design?.carouselSlidesPerView) || 1.25;
            const widthPct = 100 / perView;
            const trackId = `track-${node.id}`;
            const kids = (node.children ?? []).map((child) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: child, content: content, ctx: ctx }, child.id)));
            return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)("style", { dangerouslySetInnerHTML: {
                            __html: `
            .${trackId} {
              gap: 0 !important;
              margin-left: calc(-1 * var(--space-3, 0.75rem)) !important;
            }
            .${trackId} > div {
              flex: 0 0 ${widthPct}% !important;
              min-width: 0 !important;
              padding-left: var(--space-3, 0.75rem) !important;
              box-sizing: border-box !important;
            }
          `,
                        } }), (0, jsx_runtime_1.jsx)("div", { className: "embla", ref: ctxEmbla?.emblaRef, style: { overflow: "hidden" }, children: (0, jsx_runtime_1.jsx)("div", { ...dom, className: `${dom.className} ${trackId}`, children: kids }) })] }));
            break;
        }
        case "image": {
            const src = bound ?? props.src ?? "";
            if (!src) {
                if (ctx.isEditing) {
                    dom["data-empty"] = "true";
                    return react_1.default.createElement("span", dom);
                }
                return null;
            }
            dom.src = src;
            dom.alt = props.alt ?? "";
            dom.loading = props.loading ?? "lazy";
            const ratio = content?._design?.ratio;
            if (ratio && ratio !== "auto") {
                dom.style = { ...dom.style, aspectRatio: ratio };
            }
            const fit = content?._design?.fit;
            if (fit) {
                dom.style = { ...dom.style, objectFit: fit };
            }
            break;
        }
        case "icon": {
            // The glyph name can come from a binding (composite widget content) or a
            // static prop. Bound wins so an icon leaf renders the user's chosen icon.
            const iconName = bound ?? props.name ?? "";
            dom["data-icon"] =
                typeof iconName === "string"
                    ? iconName
                    : (iconName?.name ?? "");
            dom["aria-hidden"] = true;
            if (props.strokeWidth) {
                dom.style = { ...dom.style, strokeWidth: props.strokeWidth };
            }
            // Render the actual lucide/custom glyph. Colour, size (1em) and
            // stroke-width all inherit from this node's compiled `.n<id>` styles.
            if (iconName)
                children = (0, jsx_runtime_1.jsx)(icon_helper_1.RenderIcon, { name: iconName });
            break;
        }
        case "heading":
        case "text": {
            children = bound ?? props.text ?? "";
            break;
        }
        case "richtext": {
            const rawHtml = bound ?? props.html ?? "";
            dom.dangerouslySetInnerHTML = {
                __html: purify_1.default.sanitize(String(rawHtml)),
            };
            break;
        }
        case "embed": {
            const rawHtml = bound ?? props.html ?? "";
            dom.dangerouslySetInnerHTML = {
                __html: purify_1.embedPurifier.sanitize(String(rawHtml), {
                    ADD_TAGS: ["iframe"],
                    ADD_ATTR: [
                        "allow",
                        "allowfullscreen",
                        "frameborder",
                        "scrolling",
                        "src",
                        "width",
                        "height",
                    ],
                }),
            };
            break;
        }
        case "video": {
            const url = bound ?? props.url ?? "";
            if (!url)
                break;
            // Very basic YouTube detection for embed mapping
            if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
                const vid = url.includes("v=")
                    ? new URL(url).searchParams.get("v")
                    : url.split("/").pop();
                const src = `https://www.youtube.com/embed/${vid}`;
                children = ((0, jsx_runtime_1.jsx)("iframe", { src: src, style: { width: "100%", height: "100%", border: 0 }, allowFullScreen: true }));
            }
            else if (url.includes("vimeo.com/")) {
                const vid = url.split("/").pop();
                const src = `https://player.vimeo.com/video/${vid}`;
                children = ((0, jsx_runtime_1.jsx)("iframe", { src: src, style: { width: "100%", height: "100%", border: 0 }, allowFullScreen: true }));
            }
            else {
                children = ((0, jsx_runtime_1.jsx)("video", { src: url, poster: ctx.selfData?.thumbnail || undefined, controls: props.controls, autoPlay: props.autoplay, loop: props.loop, style: { width: "100%", height: "100%", objectFit: "cover" } }));
            }
            break;
        }
        case "button":
        case "link": {
            const action = props.action || "link";
            dom["data-action"] = action;
            const interceptClick = (e) => {
                e.preventDefault();
                if (!ctx.isEditing) {
                    e.stopPropagation();
                }
                if (action === "carousel-prev") {
                    ctxEmbla?.emblaApi?.scrollPrev();
                    return;
                }
                if (action === "carousel-next") {
                    ctxEmbla?.emblaApi?.scrollNext();
                    return;
                }
                if (action === "carousel-dot") {
                    ctxEmbla?.emblaApi?.scrollTo(ctx.repeatIndex ?? 0);
                    return;
                }
                if (ctx.onActionClick)
                    ctx.onActionClick(action);
            };
            if (action === "link" &&
                node.id !== "connectNow" &&
                node.id !== "saveContact") {
                const href = bound ?? props.href;
                if (node.tag === "link") {
                    if (ctx.isEditing || ctx.onActionClick) {
                        dom.onClick = interceptClick;
                    }
                    else {
                        dom.href = href || "#";
                    }
                }
                else if (href) {
                    if (ctx.isEditing || ctx.onActionClick) {
                        dom.onClick = interceptClick;
                    }
                    else {
                        dom.onClick = () => window.open(String(href), props.target || "_self");
                    }
                }
            }
            else if (action === "vcard" || node.id === "saveContact") {
                if (ctx.isEditing || ctx.onActionClick) {
                    dom.onClick = interceptClick;
                }
                else {
                    dom.onClick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        ctx.track({ type: "VCARD_DOWNLOAD" });
                    };
                }
            }
            else if (action === "connect" || node.id === "connectNow") {
                if (ctx.isEditing || ctx.onActionClick) {
                    dom.onClick = interceptClick;
                }
                else {
                    dom.onClick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        ctx.track({ type: "CONNECT_CLICK" });
                    };
                }
            }
            else if (action === "carousel-prev" ||
                action === "carousel-next" ||
                action === "carousel-dot") {
                dom.onClick = interceptClick;
            }
            else if (action === "share") {
                if (ctx.isEditing || ctx.onActionClick) {
                    dom.onClick = interceptClick;
                }
                else {
                    dom.onClick = async () => {
                        if (navigator.share) {
                            try {
                                await navigator.share({
                                    title: "My Digital Business Card",
                                    url: window.location.href,
                                });
                            }
                            catch (err) {
                                console.error("Share failed", err);
                            }
                        }
                        else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard");
                        }
                    };
                }
            }
            else if (action === "popup") {
                dom["data-popup"] = props.popup ?? "";
                if (ctx.onActionClick && !ctx.isEditing) {
                    dom.onClick = interceptClick;
                }
                else if (!ctx.isEditing) {
                    dom.onClick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const el = document.getElementById(props.popup);
                        if (el)
                            el.style.display = "flex";
                    };
                }
            }
            else if (action && action !== "link") {
                if (ctx.isEditing || ctx.onActionClick) {
                    dom.onClick = interceptClick;
                }
            }
            if (node.tag === "button")
                dom.type = "button";
            children = props.label ?? null;
            break;
        }
        case "divider":
        case "spacer":
            // Void — never given children, so React doesn't complain about hr/img.
            return react_1.default.createElement(tag, dom);
        default:
            break;
    }
    // Void DOM tags (img, hr, br, input) and any node that already sets
    // dangerouslySetInnerHTML (richtext, embed) must NOT receive children —
    // React 19 / Next 16 turn that into a hard error rather than a warning.
    if (VOID_DOM_TAGS.has(tag) || dom.dangerouslySetInnerHTML) {
        return react_1.default.createElement(tag, dom);
    }
    return react_1.default.createElement(tag, dom, (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [children, node.children?.map((child) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: child, content: content, ctx: ctx }, child.id))), node.id === ctx.rootId &&
                !ctx.placeholderId &&
                ctx.renderUserBlocks &&
                ctx.renderUserBlocks()] }));
}
// ─── Widgets ─────────────────────────────────────────────────────────────────
/**
 * The wrapper element IS the node.
 *
 * It carries `n<id>`, so the node's own style lands on it, and `cls()` returns
 * only `p-<part>`. That separation matters: when every part also carried
 * `n<id>`, a node-level `background` painted itself onto every inner element of
 * the widget, and `.n<id> .p-root` could never match at all.
 */
function GatedWidgetUpsell({ node, ctx, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: `n${node.id} ts-gated-upsell`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-gated": "true", style: {
            padding: "16px",
            borderRadius: "8px",
            border: "1px dashed #cbd5e1",
            background: "#f8fafc",
            textAlign: "center",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                }, children: "Pro Feature" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: "13px", color: "#334155", marginTop: "4px" }, children: [node.label || node.widget, " is locked on current plan"] })] }));
}
function mergeLayoutTrees(instance, defaultLayout) {
    const merged = { ...instance };
    const defaultChildrenMap = new Map();
    if (defaultLayout.children) {
        for (const c of defaultLayout.children) {
            if (c.id)
                defaultChildrenMap.set(c.id, c);
        }
    }
    if (merged.children && merged.children.length > 0) {
        merged.children = merged.children.map((child) => {
            if (child.kind === "element") {
                const defaultChild = defaultChildrenMap.get(child.id);
                if (defaultChild) {
                    return mergeLayoutTrees(child, defaultChild);
                }
            }
            return child;
        });
    }
    else if (defaultLayout.children && defaultLayout.children.length > 0) {
        merged.children = structuredClone(defaultLayout.children);
    }
    return merged;
}
function WidgetRenderer({ node, content, ctx, }) {
    const isGated = ctx.gatedWidgetKeys?.includes(node.key) ||
        ctx.gatedWidgetKeys?.includes(node.widget);
    if (isGated && !ctx.isEditing) {
        return (0, jsx_runtime_1.jsx)(GatedWidgetUpsell, { node: node, ctx: ctx });
    }
    // If rendering a user card (not editing template in builder) and blocks array is passed:
    if (!ctx.isEditing && Array.isArray(ctx.blocks)) {
        const w = node.widget?.toUpperCase() || "";
        // Primary card widgets are driven by card data (links, profile, vcard, etc.):
        const isCoreWidget = [
            "PROFILE",
            "CONNECT_BUTTONS",
            "HEADER",
            "NAV",
            "CONTACT_LINKS",
            "CONTACT_BUTTONS",
            "LINK_BUTTONS",
            "CUSTOM_LINKS",
            "LINKS",
            "SOCIAL_ICONS",
            "SOCIAL_LINKS",
            "SOCIAL",
            "COPYRIGHT",
            "VCARD_BUTTON",
            "SHARE_BUTTON",
        ].includes(w);
        if (isCoreWidget) {
            // CONTACT_LINKS / LINK_BUTTONS / LINKS check if user has links or blocks
            if ([
                "CONTACT_LINKS",
                "CONTACT_BUTTONS",
                "LINK_BUTTONS",
                "CUSTOM_LINKS",
                "LINKS",
            ].includes(w)) {
                const hasLinks = Array.isArray(ctx.links) && ctx.links.length > 0;
                const hasBlock = ctx.blocks.some((b) => b.type === "LINKS" ||
                    b.type === "LINK_BUTTONS" ||
                    b.type === "CONTACT_LINKS" ||
                    b.widget === "LINKS" ||
                    b.widget === "CONTACT_LINKS");
                if (!hasLinks && !hasBlock)
                    return null;
            }
            // SOCIAL_ICONS check if user has social links or blocks
            else if (["SOCIAL_ICONS", "SOCIAL_LINKS", "SOCIAL"].includes(w)) {
                const hasSocialLinks = Array.isArray(ctx.links) &&
                    ctx.links.some((l) => l.group === "social" ||
                        [
                            "instagram",
                            "facebook",
                            "twitter",
                            "x",
                            "linkedin",
                            "youtube",
                            "tiktok",
                            "github",
                            "whatsapp",
                            "telegram",
                            "discord",
                            "pinterest",
                        ].some((platform) => (l.type || l.title || l.url || "")
                            .toLowerCase()
                            .includes(platform)));
                const hasBlock = ctx.blocks.some((b) => b.type === "SOCIAL" ||
                    b.type === "SOCIAL_ICONS" ||
                    b.widget === "SOCIAL");
                if (!hasSocialLinks && !hasBlock)
                    return null;
            }
        }
        else {
            // Optional block widgets (FAQ, Gallery, Contact Form, Video, Custom HTML, etc.)
            if (!ctx.isRenderingUserBlocks) {
                if (node.id === ctx.placeholderId &&
                    ctx.renderUserBlocks &&
                    !ctx.injectBefore) {
                    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: ctx.renderUserBlocks() });
                }
                return null;
            }
        }
    }
    // Tag every analytics event from this widget with its stable node key so
    // the backend can attribute clicks to the specific widget instance
    // (dynamic per-widget analytics).
    const widgetCtx = {
        ...ctx,
        track: (event) => ctx.track({ widgetKey: node.key, ...event }),
    };
    const Widget = widgets_2.WIDGET_RENDERERS[node.widget];
    const widgetMeta = (0, widgets_1.getWidgetMeta)(node.widget);
    const widgetContent = content?.[node.key] ?? node.defaultContent ?? {};
    // For derived widgets that have NO defaultLayout defined in their meta,
    // skip any stored node.layout and use the React render component directly.
    // This handles CONTACT_LINKS (and similar) where the old defaultLayout was
    // removed from meta — without this, a stale node.layout from the DB would
    // keep rendering an element tree with broken self-bindings, invisible labels,
    // and confusing link icons in the editor layers panel.
    // Derived widgets that DO have a defaultLayout (e.g. PROFILE) are unaffected.
    // Also applies to deprecated widgets: if they have a defaultLayout, render it.
    const hasMetaLayout = widgetMeta?.defaultLayout != null;
    const forceComponentRender = ["CONTACT_LINKS", "LINKS", "LINK_BUTTONS", "CUSTOM_LINKS"].includes(node.widget);
    const skipStoredLayout = forceComponentRender || (widgetMeta?.derived === true && !hasMetaLayout);
    const layout = skipStoredLayout
        ? undefined
        : node.layout && widgetMeta?.defaultLayout
            ? mergeLayoutTrees(node.layout, widgetMeta.defaultLayout)
            : (node.layout ?? widgetMeta?.defaultLayout);
    // Deprecated widgets or widgets without a custom renderer fall back to layout tree.
    if (layout) {
        const mergedLayout = {
            ...layout,
            style: {
                ...(layout.style ?? {}),
                ...(node.style ?? {}),
                base: {
                    ...(layout.style?.base ?? {}),
                    ...(node.style?.base ?? {}),
                },
            },
        };
        return ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-widget": node.widget, "data-node-id": ctx.isEditing ? node.id : undefined, children: (0, jsx_runtime_1.jsx)(NodeRenderer, { node: mergedLayout, content: {
                    [node.key]: widgetContent,
                    _design: { ...(node.design || {}), ...(widgetContent || {}) },
                }, ctx: { ...widgetCtx, selfData: widgetContent } }) }));
    }
    // No layout and no custom Widget renderer — this shouldn't happen in normal flow
    // (all widgets have either a layout or a renderer), but handle it gracefully.
    if (!Widget) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-widget": node.widget, children: ctx.isEditing ? `Unknown widget: ${node.widget}` : null }));
    }
    const design = node.design ?? {};
    const cls = (part) => `p-${part}`;
    const renderedWidget = ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-widget": node.widget, children: (0, jsx_runtime_1.jsx)(Widget, { content: widgetContent, design: design, cls: cls, ctx: widgetCtx }) }));
    if (!ctx.isEditing &&
        Array.isArray(ctx.blocks) &&
        node.id === ctx.placeholderId &&
        ctx.injectBefore &&
        ctx.renderUserBlocks) {
        return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [ctx.renderUserBlocks(), renderedWidget] }));
    }
    return renderedWidget;
}
// ─── Slots ───────────────────────────────────────────────────────────────────
function SlotRenderer({ node, content, ctx, }) {
    const items = content?.[node.key]?.items ?? [];
    return ((0, jsx_runtime_1.jsxs)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-slot": node.key, "data-empty": items.length === 0 ? "true" : undefined, children: [items.map((item, i) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: item, content: content, ctx: ctx }, item.id ?? i))), ctx.isEditing &&
                items.length === 0 &&
                `Empty slot: ${node.label || node.key}`] }));
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function isEmpty(value) {
    if (value === undefined || value === null)
        return true;
    if (typeof value === "string")
        return value.trim() === "";
    if (Array.isArray(value))
        return value.length === 0;
    return false;
}
function clampLevel(level) {
    const n = Number(level);
    return Number.isFinite(n) && n >= 1 && n <= 6 ? Math.floor(n) : 2;
}
