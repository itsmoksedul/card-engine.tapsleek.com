"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockRenderer = BlockRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const resolve_design_1 = require("../blocks/resolve-design");
const registry_1 = require("../widgets/registry");
const widgets_1 = require("./widgets");
const NodeRenderer_1 = require("./NodeRenderer");
/**
 * One user-composed block (v2.1).
 *
 * The wrapper carries `tsb-<type>` — the class the compiler emits the template's
 * per-type preset under — so the block is styled by the card's template with no
 * per-card CSS. Design comes from `resolveBlockDesign`; the user only supplies
 * `content`. Derived widgets (Profile, Contact Buttons) ignore `content` and
 * read `ctx.card` / `ctx.links`.
 */
function BlockRenderer({ definition, block, ctx, }) {
    const rawType = block.widget || block.type || '';
    const widgetType = (0, registry_1.normalizeWidgetType)(rawType);
    const Widget = widgets_1.WIDGET_RENDERERS[widgetType];
    const { design, layout, hasCustomLayout } = (0, resolve_design_1.resolveBlockDesign)(definition, widgetType);
    const meta = (0, registry_1.getWidgetMeta)(widgetType);
    const content = block.content ?? meta?.defaultContent ?? {};
    const mergedDesign = { ...(design || {}), ...(content || {}) };
    // 1. If the template explicitly defined a custom layout tree for this widget instance, render it:
    if (hasCustomLayout && layout) {
        const safeLayout = layout.id === 'root'
            ? { ...layout, id: `${widgetType.toLowerCase()}-root` }
            : layout;
        return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-widget": block.widget, "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: '100%', boxSizing: 'border-box' }, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: safeLayout, content: { [block.id]: content, _design: mergedDesign }, ctx: { ...ctx, selfData: content } }) }));
    }
    // 2. Specialized Widget renderer (Video with YouTube iframe, Map, Title, Description, etc.)
    if (Widget) {
        return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-widget": block.widget, "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: '100%', boxSizing: 'border-box' }, children: (0, jsx_runtime_1.jsx)(Widget, { content: content, design: mergedDesign, cls: (part) => `p-${part}`, ctx: ctx }) }));
    }
    // 3. Fallback to defaultLayout if no specialized Widget renderer exists
    if (layout) {
        const safeLayout = layout.id === 'root'
            ? { ...layout, id: `${widgetType.toLowerCase()}-root` }
            : layout;
        return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-widget": block.widget, "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: '100%', boxSizing: 'border-box' }, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: safeLayout, content: { [block.id]: content, _design: mergedDesign }, ctx: { ...ctx, selfData: content } }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: '100%', boxSizing: 'border-box' }, children: ctx.isEditing ? `Unknown widget: ${block.widget}` : null }));
}
