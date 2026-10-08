"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarouselContext = void 0;
exports.NodeRenderer = NodeRenderer;
exports.structuralFrom = structuralFrom;
exports.mergeLayoutTrees = mergeLayoutTrees;
const jsx_runtime_1 = require("react/jsx-runtime");
const embla_carousel_autoplay_1 = __importDefault(require("embla-carousel-autoplay"));
const embla_carousel_react_1 = __importDefault(require("embla-carousel-react"));
const react_1 = __importDefault(require("react"));
const widgets_1 = require("../widgets");
const card_visibility_1 = require("./card-visibility");
const resolveBinding_1 = require("./resolveBinding");
const sanitize_1 = require("./sanitize");
const widgets_2 = require("./widgets");
const icon_helper_1 = require("./widgets/icon-helper");
function NodeRenderer({ node, content, ctx }) {
    if (ctx.collapsedIds?.has(node.id))
        return null;
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
/**
 * The only `node.props` keys that reach the DOM (plus `data-*` / `aria-*`).
 *
 * Templates are JSON and can be imported from a file, so forwarding every key
 * let `props.dangerouslySetInnerHTML`, `srcdoc`, `formaction`… through as raw
 * HTML/attributes. `href`/`src` are handled per tag with URL checks instead.
 */
const DOM_PROPS = new Set([
    "title",
    "alt",
    "target",
    "rel",
    "placeholder",
    "width",
    "height",
    "tabIndex",
    "role",
]);
function isForwardableProp(key, value) {
    if (typeof value !== "string" &&
        typeof value !== "number" &&
        typeof value !== "boolean") {
        return false;
    }
    return DOM_PROPS.has(key) || /^(data|aria)-[a-z0-9-]+$/.test(key);
}
/** Tags a `frame` may render as via `props.as` — semantic containers only. */
const FRAME_AS = new Set([
    "div",
    "section",
    "header",
    "footer",
    "nav",
    "main",
    "article",
    "aside",
    "figure",
    "ul",
    "ol",
    "li",
    "span",
]);
/** A bound value that is a link target rather than display text. */
function looksLikeUrl(value) {
    return (typeof value === "string" &&
        /^(https?:|mailto:|tel:|sms:|\/|#)/i.test(value.trim()));
}
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
        return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: items.map((item, index) => ((0, jsx_runtime_1.jsx)(ElementRenderer, { node: {
                    ...node,
                    repeat: undefined,
                    // A repeater over the card's links stamps each row's id so the
                    // card page's click beacon can attribute LINK_CLICKs per link.
                    ...(node.repeat?.source === "self" &&
                        node.repeat.path === "links" &&
                        typeof item?.id === "string"
                        ? {
                            props: {
                                ...(node.props ?? {}),
                                "data-link-id": item.id,
                                ...(typeof item.type === "string"
                                    ? { "data-link-type": item.type }
                                    : {}),
                            },
                        }
                        : {}),
                }, content: content, ctx: { ...ctx, selfData: item, repeatIndex: index } }, item.id ?? index))) }));
    }
    const bound = (0, resolveBinding_1.resolveBinding)(node.bind, ctx.card, content, ctx.selfData);
    const props = (node.props ?? {});
    const isBound = Boolean(node.bind);
    const isCardBound = node.bind?.source === "card";
    // Check fallback from content/selfData by nodeId or key if unbound
    const fallbackVal = (node.id ? content?.[node.id] : undefined) ??
        (node.id ? ctx.selfData?.[node.id] : undefined);
    const activeVal = !isEmpty(bound) ? bound : fallbackVal;
    const resolvedText = typeof activeVal === "object" && activeVal !== null
        ? (activeVal.text ?? activeVal.value ?? "")
        : activeVal;
    if (node.hideIfEmpty) {
        if (isBound) {
            const isValEmpty = node.tag === "image"
                ? isEmpty(bound ?? fallbackVal)
                : node.tag === "video"
                    ? isEmpty(bound ?? fallbackVal)
                    : isEmpty(resolvedText);
            if (isValEmpty) {
                return null;
            }
        }
        else {
            if (isEmpty(resolvedText) &&
                !props.src &&
                !props.text &&
                !props.html) {
                return null;
            }
        }
    }
    const tag = node.tag === "frame"
        ? FRAME_AS.has(String(props.as))
            ? String(props.as)
            : "div"
        : node.tag === "heading"
            ? `h${clampLevel(props.level)}`
            : TAG_MAP[node.tag] || "div";
    let isCarouselDotActive = false;
    if (props.action === "carousel-dot" &&
        ctxEmbla?.selectedIndex === ctx.repeatIndex) {
        isCarouselDotActive = true;
    }
    const customClass = typeof props.className === "string" && props.className.trim()
        ? ` ${props.className}`
        : "";
    const isTemplateRoot = node.id === ctx.rootId && !ctx.isRenderingUserBlocks;
    const domNodeClass = isTemplateRoot ? node.id : (node.id === "root" ? "elem-root" : node.id);
    const dom = {
        className: `n${domNodeClass} p-${node.id}${isCarouselDotActive ? " p-carouselDotActive" : ""}${customClass}`,
    };
    // Only forward allowlisted, primitive attributes.
    for (const [key, value] of Object.entries(props)) {
        if (ENGINE_PROPS.has(key) || key === "className")
            continue;
        if (isForwardableProp(key, value))
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
            const src = bound ??
                (isCardBound && ctx.card ? undefined : props.src) ??
                "";
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
            if (isBound) {
                if (!isEmpty(resolvedText)) {
                    children = resolvedText;
                }
                else if (isCardBound && ctx.card) {
                    children = "";
                }
                else if (ctx.selfData !== undefined || content !== undefined) {
                    children = "";
                }
                else {
                    children = props.text ?? "";
                }
            }
            else {
                children = !isEmpty(resolvedText) ? resolvedText : (props.text ?? "");
            }
            break;
        }
        case "richtext": {
            const rawHtml = bound ??
                (isCardBound && ctx.card ? "" : props.html ?? "");
            dom.dangerouslySetInnerHTML = {
                __html: (0, sanitize_1.sanitizeHtml)(String(rawHtml), "richtext"),
            };
            break;
        }
        case "embed": {
            const rawHtml = bound ??
                (isCardBound && ctx.card ? "" : props.html ?? "");
            dom.dangerouslySetInnerHTML = {
                __html: (0, sanitize_1.sanitizeHtml)(String(rawHtml), "embed"),
            };
            break;
        }
        case "video": {
            const url = bound ??
                (isCardBound && ctx.card ? undefined : props.url) ??
                "";
            if (!url)
                break;
            // Very basic YouTube detection for embed mapping
            if (url.includes("youtube.com") ||
                url.includes("youtube-nocookie.com") ||
                url.includes("youtu.be/")) {
                let vid = "";
                try {
                    const parsed = new URL(url);
                    vid =
                        parsed.searchParams.get("v") ||
                            parsed.pathname.split("/").filter(Boolean).pop() ||
                            "";
                }
                catch {
                    vid = url.split("/").pop() || "";
                }
                const src = `https://www.youtube-nocookie.com/embed/${vid}`;
                children = ((0, jsx_runtime_1.jsx)("iframe", { src: src, style: { width: "100%", height: "100%", border: 0 }, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowFullScreen: true, referrerPolicy: "strict-origin-when-cross-origin" }));
            }
            else if (url.includes("vimeo.com/")) {
                const vid = url.split("/").pop();
                const src = `https://player.vimeo.com/video/${vid}`;
                children = ((0, jsx_runtime_1.jsx)("iframe", { src: src, style: { width: "100%", height: "100%", border: 0 }, allow: "autoplay; fullscreen; picture-in-picture", allowFullScreen: true, referrerPolicy: "strict-origin-when-cross-origin" }));
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
            // A bound value is the link target when it looks like a URL; otherwise
            // (e.g. a button bound to its label text) it is display text. Treating
            // every bound value as a URL made labelled buttons render empty and
            // `window.open("Choose a time")` on click.
            const boundIsUrl = looksLikeUrl(bound);
            const href = (0, sanitize_1.safeHref)(boundIsUrl ? bound : props.href) ?? undefined;
            const boundLabel = !boundIsUrl && (typeof bound === "string" || typeof bound === "number")
                ? String(bound)
                : null;
            if (action === "link" &&
                node.id !== "connectNow" &&
                node.id !== "saveContact") {
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
                        dom.onClick = () => window.open(href, props.target === "_blank" ? "_blank" : "_self", props.target === "_blank" ? "noopener,noreferrer" : undefined);
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
            if (node.tag === "link" && props.target === "_blank") {
                dom.target = "_blank";
                dom.rel = "noopener noreferrer";
            }
            children = props.label ?? boundLabel;
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
    // When rendering a user card (blocks present), sort the direct widget
    // children of this element by the user's block position, so drag-reorder
    // in the editor is immediately reflected in the preview.
    let sortedChildren = node.children;
    if (!ctx.isEditing &&
        ctx.blockPositionMap &&
        ctx.blockPositionMap.size > 0 &&
        node.children &&
        node.children.some((c) => c.kind === "widget" && ctx.blockPositionMap.has(c.id))) {
        sortedChildren = [...node.children].sort((a, b) => {
            const posA = ctx.blockPositionMap.get(a.id) ?? Infinity;
            const posB = ctx.blockPositionMap.get(b.id) ?? Infinity;
            return posA - posB;
        });
    }
    return react_1.default.createElement(tag, dom, (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [children, sortedChildren?.map((child) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: child, content: content, ctx: ctx }, child.id))), node.id === ctx.rootId &&
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
/**
 * Structure comes from the widget's code, not the stored copy: the builder
 * never edits a layout node's tag/binding, so a stored layout only diverges
 * from the default when the default was fixed later. Taking these from the
 * default lets such fixes reach templates saved before them; style, props and
 * hidden stay the instance's (that is what the admin edits).
 */
function structuralFrom(def) {
    const out = { tag: def.tag };
    if (def.bind !== undefined)
        out.bind = def.bind;
    if (def.repeat !== undefined)
        out.repeat = def.repeat;
    if (def.hideIfEmpty !== undefined)
        out.hideIfEmpty = def.hideIfEmpty;
    if (def.visibleIf !== undefined)
        out.visibleIf = def.visibleIf;
    return out;
}
function mergeLayoutTrees(instance, defaultLayout) {
    let instChildren = instance.children;
    // Backward compatibility: If instance has a single wrapper child like "list"
    // but defaultLayout has its items (like "item") directly under root, unwrap the list wrapper.
    if (instChildren &&
        instChildren.length === 1 &&
        instChildren[0].kind === "element" &&
        instChildren[0].id === "list" &&
        defaultLayout.children?.some((c) => c.id === "item") &&
        !defaultLayout.children?.some((c) => c.id === "list")) {
        const listNode = instChildren[0];
        instChildren = listNode.children || [];
    }
    const merged = {
        ...instance,
        // Same id ⇒ same node; a different id (e.g. the admin wrapped the layout
        // in a new frame) is the admin's own structure and is left alone.
        ...(instance.id === defaultLayout.id ? structuralFrom(defaultLayout) : {}),
        children: instChildren,
    };
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
    else if (merged.children === undefined &&
        defaultLayout.children &&
        defaultLayout.children.length > 0) {
        // Only fill children the instance never had. An explicit `[]` means the
        // admin deleted them — refilling made the last child undeletable.
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
    // On a user card (blocks passed, not the builder): optional block widgets
    // (FAQ, Gallery, Contact Form…) only render through the user's blocks, and
    // links/social widgets with nothing to show disappear.
    if (!ctx.isEditing && Array.isArray(ctx.blocks)) {
        const matchedBlock = ctx.blockNodeMap?.get(node.id);
        if (matchedBlock && ctx.renderBlock) {
            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: ctx.renderBlock(matchedBlock) });
        }
        if (!(0, card_visibility_1.isCoreWidget)(node.widget) &&
            !ctx.isRenderingUserBlocks &&
            node.id === ctx.placeholderId &&
            ctx.renderUserBlocks &&
            !ctx.injectBefore) {
            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: ctx.renderUserBlocks() });
        }
        if ((0, card_visibility_1.isWidgetHiddenOnCard)(node, ctx))
            return null;
    }
    // Tag every analytics event from this widget with its stable node key so
    // the backend can attribute clicks to the specific widget instance
    // (dynamic per-widget analytics).
    //
    // `collapsedIds` holds TEMPLATE ids; a widget's layout reuses short ids
    // ("root", "title", "item"…) that could collide, so it stops here.
    const widgetCtx = {
        ...ctx,
        collapsedIds: undefined,
        track: (event) => ctx.track({ widgetKey: node.key, ...event }),
    };
    const Widget = widgets_2.WIDGET_RENDERERS[node.widget];
    const widgetMeta = (0, widgets_1.getWidgetMeta)(node.widget);
    const wType = (node.widget || "").toUpperCase();
    // Resolve content for this widget from direct keys, IDs, or selfData (custom blocks)
    let rawWidgetContent = (node.key ? content?.[node.key] : undefined) ??
        (node.id ? content?.[node.id] : undefined) ??
        (node.key ? ctx.selfData?.[node.key] : undefined) ??
        (node.id ? ctx.selfData?.[node.id] : undefined);
    // If inside a block/group and not matched directly, infer by widget type conventions
    if (rawWidgetContent === undefined && ctx.selfData) {
        if (wType === "TITLE" || wType === "HEADING") {
            rawWidgetContent =
                ctx.selfData.title ??
                    ctx.selfData.title_1 ??
                    ctx.selfData.heading ??
                    ctx.selfData.heading_1;
        }
        else if (wType === "DESCRIPTION" || wType === "RICH_TEXT") {
            rawWidgetContent =
                ctx.selfData.description ??
                    ctx.selfData.description_1 ??
                    ctx.selfData.text ??
                    ctx.selfData.text_1;
        }
        else if (wType === "VIDEO") {
            rawWidgetContent =
                ctx.selfData.videoUrl ??
                    ctx.selfData.videoUrl_1 ??
                    ctx.selfData.url;
        }
        else if (wType === "IMAGE") {
            rawWidgetContent =
                ctx.selfData.imageUrl ??
                    ctx.selfData.imageUrl_1 ??
                    ctx.selfData.src;
        }
    }
    // Normalize into standard widget data structure
    let widgetContent;
    if (typeof rawWidgetContent === "string" || typeof rawWidgetContent === "number") {
        if (wType === "TITLE" ||
            wType === "HEADING" ||
            wType === "DESCRIPTION" ||
            wType === "RICH_TEXT") {
            widgetContent = {
                ...(node.defaultContent ?? {}),
                text: String(rawWidgetContent),
            };
        }
        else if (wType === "VIDEO") {
            widgetContent = {
                ...(node.defaultContent ?? {}),
                url: String(rawWidgetContent),
            };
        }
        else if (wType === "IMAGE") {
            widgetContent = {
                ...(node.defaultContent ?? {}),
                src: String(rawWidgetContent),
            };
        }
        else {
            widgetContent = {
                ...(node.defaultContent ?? {}),
                text: String(rawWidgetContent),
                value: String(rawWidgetContent),
            };
        }
    }
    else if (rawWidgetContent && typeof rawWidgetContent === "object") {
        widgetContent = { ...(node.defaultContent ?? {}), ...rawWidgetContent };
    }
    else {
        widgetContent =
            (node.key ? content?.[node.key] : undefined) ??
                node.defaultContent ??
                {};
    }
    // For derived widgets that have NO defaultLayout defined in their meta,
    // skip any stored node.layout and use the React render component directly.
    // This handles CONTACT_LINKS (and similar) where the old defaultLayout was
    // removed from meta — without this, a stale node.layout from the DB would
    // keep rendering an element tree with broken self-bindings, invisible labels,
    // and confusing link icons in the editor layers panel.
    // Derived widgets that DO have a defaultLayout (e.g. PROFILE) are unaffected.
    // Also applies to deprecated widgets: if they have a defaultLayout, render it.
    const hasMetaLayout = widgetMeta?.defaultLayout != null;
    const skipStoredLayout = widgetMeta?.derived === true && !hasMetaLayout;
    const layout = skipStoredLayout
        ? undefined
        : node.layout && widgetMeta?.defaultLayout
            ? mergeLayoutTrees(node.layout, widgetMeta.defaultLayout)
            : (node.layout ?? widgetMeta?.defaultLayout);
    // Deprecated widgets or widgets without a custom renderer fall back to layout tree.
    if (layout) {
        // Only the part class. Every layout root is id "root" — the same id as the
        // template root — so also stamping `n<layoutId>` made the TEMPLATE root's
        // `.ts-card .nroot{padding;border;background…}` rule hit every widget.
        // The layout root's own style is compiled onto `.n<widgetId>` instead.
        const layoutClasses = [
            layout.id ? `p-${layout.id}` : "",
            layout.props?.className || "",
        ]
            .filter(Boolean)
            .join(" ");
        const mergedLayout = {
            ...layout,
            id: node.id,
            props: {
                ...(layout.props || {}),
                "data-widget": node.widget,
                ...(node.key ? { "data-widget-key": node.key } : {}),
                ...(layoutClasses ? { className: layoutClasses } : {}),
            },
            style: {
                ...(layout.style ?? {}),
                ...(node.style ?? {}),
                base: {
                    ...(layout.style?.base ?? {}),
                    ...(node.style?.base ?? {}),
                },
                sm: {
                    ...(layout.style?.sm ?? {}),
                    ...(node.style?.sm ?? {}),
                },
                md: {
                    ...(layout.style?.md ?? {}),
                    ...(node.style?.md ?? {}),
                },
            },
        };
        const renderedLayout = ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: mergedLayout, content: {
                // Keep the card-level content visible inside the layout so a widget
                // nested here (e.g. Connect Buttons in Profile) still finds its own
                // content by key.
                ...(content ?? {}),
                [node.key]: widgetContent,
                _design: { ...(node.design || {}), ...(widgetContent || {}) },
            }, ctx: { ...widgetCtx, selfData: widgetContent } }));
        if (!ctx.isEditing &&
            Array.isArray(ctx.blocks) &&
            node.id === ctx.placeholderId &&
            ctx.injectBefore &&
            ctx.renderUserBlocks) {
            return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [ctx.renderUserBlocks(), renderedLayout] }));
        }
        return renderedLayout;
    }
    // No layout and no custom Widget renderer — this shouldn't happen in normal flow
    // (all widgets have either a layout or a renderer), but handle it gracefully.
    if (!Widget) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-widget": node.widget, children: ctx.isEditing ? `Unknown widget: ${node.widget}` : null }));
    }
    const design = node.design ?? {};
    const cls = (part) => `p-${part} n${part}`;
    const renderedWidget = ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-widget": node.widget, "data-widget-key": node.key || undefined, children: (0, jsx_runtime_1.jsx)(Widget, { content: widgetContent, design: design, cls: cls, ctx: widgetCtx }) }));
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
