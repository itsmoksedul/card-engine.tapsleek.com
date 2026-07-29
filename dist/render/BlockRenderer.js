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
    const Widget = widgets_1.WIDGET_RENDERERS[block.widget];
    const { design, layout } = (0, resolve_design_1.resolveBlockDesign)(definition, block.widget);
    const meta = (0, registry_1.getWidgetMeta)(block.widget);
    const content = block.content ?? meta?.defaultContent ?? {};
    if (layout) {
        return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-widget": block.widget, "data-block-id": ctx.isEditing ? block.id : undefined, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: layout, content: { [block.id]: content }, ctx: { ...ctx, selfData: content } }) }));
    }
    if (!Widget) {
        return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-block-id": ctx.isEditing ? block.id : undefined, children: ctx.isEditing ? `Unknown widget: ${block.widget}` : null }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(block.widget), "data-widget": block.widget, "data-block-id": ctx.isEditing ? block.id : undefined, children: (0, jsx_runtime_1.jsx)(Widget, { content: content, design: design, cls: (part) => `p-${part}`, ctx: ctx }) }));
}
