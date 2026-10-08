"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockRenderer = BlockRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const custom_blocks_1 = require("../blocks/custom-blocks");
const resolve_design_1 = require("../blocks/resolve-design");
const registry_1 = require("../widgets/registry");
const NodeRenderer_1 = require("./NodeRenderer");
const widgets_1 = require("./widgets");
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
    const rawType = block.widget || block.type || "";
    // 0. Template Custom Block (authored from Layer Groups in Admin)
    const rawTypeLower = rawType.toLowerCase();
    const customBlock = definition.customBlocks?.find((cb) => cb.id === rawType ||
        cb.id === block.widget ||
        cb.id === block.type ||
        cb.id.toLowerCase() === rawTypeLower ||
        cb.label?.toLowerCase() === rawTypeLower);
    if (customBlock) {
        // Defaults first so fields added to the template later still render.
        const blockContent = {
            ...(customBlock.defaultContent ?? {}),
            ...(block.content ?? {}),
        };
        const nodeContentMap = {};
        for (const f of customBlock.fields ?? []) {
            // Locked fields always show the template's value.
            if (f.editable === false) {
                blockContent[f.key] = customBlock.defaultContent?.[f.key];
            }
            const val = blockContent[f.key];
            // Prop-based fields are written straight into the layout below; the
            // node-id fallback is only for blocks made before `prop` existed.
            if (val !== undefined && !f.prop) {
                nodeContentMap[f.nodeId] = val;
                nodeContentMap[f.key] = val;
            }
        }
        const mergedData = {
            ...nodeContentMap,
            ...blockContent,
        };
        const cbLayout = (0, custom_blocks_1.applyCustomBlockContent)(customBlock, block.content);
        const blockLayout = {
            ...cbLayout,
            id: cbLayout.id === "root"
                ? `${customBlock.id}-root`
                : cbLayout.id,
            props: {
                ...(cbLayout.props || {}),
                className: [
                    (0, resolve_design_1.blockClass)(customBlock.id),
                    cbLayout.props?.className,
                ]
                    .filter(Boolean)
                    .join(" "),
                "data-widget": customBlock.id,
                "data-custom-block": "true",
                ...(ctx.isEditing ? { "data-block-id": block.id } : {}),
            },
        };
        return ((0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: blockLayout, content: { [block.id]: blockContent, ...mergedData }, ctx: { ...ctx, selfData: mergedData } }));
    }
    const widgetType = (0, registry_1.normalizeWidgetType)(rawType);
    const { design, layout } = (0, resolve_design_1.resolveBlockDesign)(definition, widgetType);
    const meta = (0, registry_1.getWidgetMeta)(widgetType);
    const content = block.content ?? meta?.defaultContent ?? {};
    const mergedDesign = { ...(design || {}), ...(content || {}) };
    // 1. If layout exists (either template instance layout or defaultLayout), render it directly!
    // This ensures identical DOM hierarchy, padding, margin, font-size, background as Admin!
    if (layout) {
        const blockLayout = {
            ...layout,
            id: layout.id === "root"
                ? `${widgetType.toLowerCase()}-root`
                : layout.id,
            props: {
                ...(layout.props || {}),
                className: [
                    (0, resolve_design_1.blockClass)(widgetType),
                    layout.props?.className,
                ]
                    .filter(Boolean)
                    .join(" "),
                "data-widget": widgetType,
                ...(ctx.isEditing ? { "data-block-id": block.id } : {}),
            },
        };
        return ((0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: blockLayout, content: { [block.id]: content, _design: mergedDesign }, ctx: { ...ctx, selfData: content } }));
    }
    // 2. Specialized Widget renderer fallback ONLY if no layout exists
    const Widget = widgets_1.WIDGET_RENDERERS[widgetType];
    if (Widget) {
        return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(widgetType), "data-widget": widgetType, "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: "100%", boxSizing: "border-box" }, children: (0, jsx_runtime_1.jsx)(Widget, { content: content, design: mergedDesign, cls: (part) => `p-${part}`, ctx: ctx }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, resolve_design_1.blockClass)(widgetType), "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: "100%", boxSizing: "border-box" }, children: ctx.isEditing ? `Unknown widget: ${block.widget}` : null }));
}
