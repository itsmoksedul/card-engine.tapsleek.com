"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRenderer = NodeRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const resolveBinding_1 = require("./resolveBinding");
const widgets_1 = require("./widgets");
function NodeRenderer({ node, content, ctx }) {
    if (node.kind === 'element')
        return (0, jsx_runtime_1.jsx)(ElementRenderer, { node: node, content: content, ctx: ctx });
    if (node.kind === 'widget')
        return (0, jsx_runtime_1.jsx)(WidgetRenderer, { node: node, content: content, ctx: ctx });
    if (node.kind === 'slot')
        return (0, jsx_runtime_1.jsx)(SlotRenderer, { node: node, content: content, ctx: ctx });
    return null;
}
// ─── Elements ────────────────────────────────────────────────────────────────
const TAG_MAP = {
    frame: 'div',
    stack: 'div',
    grid: 'div',
    text: 'p',
    richtext: 'div',
    image: 'img',
    icon: 'span',
    button: 'button',
    link: 'a',
    divider: 'hr',
    spacer: 'div',
};
/**
 * Props that configure the ENGINE, not the DOM.
 *
 * These must never reach an HTML element: React forwards unknown attributes
 * verbatim, so spreading `node.props` produced `<p text="…">` and
 * `<img fit="cover">` — invalid HTML plus a console warning per node.
 */
const ENGINE_PROPS = new Set([
    'text', 'html', 'level', 'as', 'fit', 'ratio', 'action', 'popup',
    'label', 'name', 'size', 'icon', 'loading',
]);
function ElementRenderer({ node, content, ctx, }) {
    const bound = (0, resolveBinding_1.resolveBinding)(node.bind, ctx.card, content);
    const props = (node.props ?? {});
    // A bound node that resolves empty disappears entirely — that's what stops an
    // absent bio leaving a gap in the layout.
    if (node.hideIfEmpty && isEmpty(bound))
        return null;
    const tag = node.tag === 'frame'
        ? props.as || 'div'
        : node.tag === 'heading'
            ? `h${clampLevel(props.level)}`
            : TAG_MAP[node.tag] || 'div';
    const dom = { className: `n${node.id}` };
    // Only forward attributes the DOM actually understands.
    for (const [key, value] of Object.entries(props)) {
        if (ENGINE_PROPS.has(key))
            continue;
        dom[key] = value;
    }
    if (ctx.isEditing)
        dom['data-node-id'] = node.id;
    if (node.a11y?.role)
        dom.role = node.a11y.role;
    if (node.a11y?.label)
        dom['aria-label'] = node.a11y.label;
    let children = null;
    switch (node.tag) {
        case 'image': {
            dom.src = bound ?? props.src ?? '';
            dom.alt = props.alt ?? '';
            dom.loading = props.loading ?? 'lazy';
            if (!dom.src)
                return ctx.isEditing ? (0, jsx_runtime_1.jsx)("span", { ...dom, "data-empty": "true" }) : null;
            break;
        }
        case 'icon': {
            dom['data-icon'] = props.name ?? '';
            dom['aria-hidden'] = true;
            break;
        }
        case 'heading':
        case 'text': {
            children = bound ?? props.text ?? '';
            break;
        }
        case 'richtext': {
            // Sanitised server-side on write.
            dom.dangerouslySetInnerHTML = { __html: bound ?? props.html ?? '' };
            break;
        }
        case 'button':
        case 'link': {
            const action = props.action || 'link';
            dom['data-action'] = action;
            if (action === 'link') {
                const href = bound ?? props.href;
                if (node.tag === 'link')
                    dom.href = href || '#';
                else if (href)
                    dom.onClick = () => window.open(String(href), props.target || '_self');
            }
            else if (action === 'popup') {
                dom['data-popup'] = props.popup ?? '';
            }
            if (node.tag === 'button')
                dom.type = 'button';
            children = props.label ?? null;
            break;
        }
        case 'divider':
        case 'spacer':
            // Void — never given children, so React doesn't complain about hr/img.
            return react_1.default.createElement(tag, dom);
        default:
            break;
    }
    return react_1.default.createElement(tag, dom, node.tag === 'richtext' ? undefined : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [children, node.children?.map((child) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: child, content: content, ctx: ctx }, child.id)))] })));
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
function WidgetRenderer({ node, content, ctx, }) {
    const Widget = widgets_1.WIDGET_RENDERERS[node.widget];
    if (!Widget) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, children: ctx.isEditing ? `Unknown widget: ${node.widget}` : null }));
    }
    const widgetContent = content?.[node.key] ?? node.defaultContent ?? {};
    return ((0, jsx_runtime_1.jsx)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-widget": node.widget, children: (0, jsx_runtime_1.jsx)(Widget, { content: widgetContent, design: node.design ?? {}, cls: (part) => `p-${part}`, ctx: ctx }) }));
}
// ─── Slots ───────────────────────────────────────────────────────────────────
function SlotRenderer({ node, content, ctx }) {
    const items = content?.[node.key]?.items ?? [];
    return ((0, jsx_runtime_1.jsxs)("div", { className: `n${node.id}`, "data-node-id": ctx.isEditing ? node.id : undefined, "data-slot": node.key, "data-empty": items.length === 0 ? 'true' : undefined, children: [items.map((item, i) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: item, content: content, ctx: ctx }, item.id ?? i))), ctx.isEditing && items.length === 0 && `Empty slot: ${node.label || node.key}`] }));
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function isEmpty(value) {
    if (value === undefined || value === null)
        return true;
    if (typeof value === 'string')
        return value.trim() === '';
    if (Array.isArray(value))
        return value.length === 0;
    return false;
}
function clampLevel(level) {
    const n = Number(level);
    return Number.isFinite(n) && n >= 1 && n <= 6 ? Math.floor(n) : 2;
}
