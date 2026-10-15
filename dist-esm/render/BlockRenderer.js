"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { applyCustomBlockContent } from "../blocks/custom-blocks";
import { blockClass, resolveBlockDesign } from "../blocks/resolve-design";
import { getWidgetMeta, normalizeWidgetType } from "../widgets/registry";
import { NodeRenderer } from "./NodeRenderer";
import { WIDGET_RENDERERS } from "./widgets";
/**
 * One user-composed block (v2.1).
 *
 * The wrapper carries `tsb-<type>` — the class the compiler emits the template's
 * per-type preset under — so the block is styled by the card's template with no
 * per-card CSS. Design comes from `resolveBlockDesign`; the user only supplies
 * `content`. Derived widgets (Profile, Contact Buttons) ignore `content` and
 * read `ctx.card` / `ctx.links`.
 */
export function BlockRenderer({ definition, block, ctx, }) {
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
        const cbLayout = applyCustomBlockContent(customBlock, block.content);
        const blockLayout = {
            ...cbLayout,
            id: cbLayout.id === "root"
                ? `${customBlock.id}-root`
                : cbLayout.id,
            props: {
                ...(cbLayout.props || {}),
                className: [
                    blockClass(customBlock.id),
                    cbLayout.props?.className,
                ]
                    .filter(Boolean)
                    .join(" "),
                "data-widget": customBlock.id,
                "data-custom-block": "true",
                ...(ctx.isEditing ? { "data-block-id": block.id } : {}),
            },
        };
        return (_jsx(NodeRenderer, { node: blockLayout, content: { [block.id]: blockContent, ...mergedData }, ctx: { ...ctx, selfData: mergedData } }));
    }
    const widgetType = normalizeWidgetType(rawType);
    const { design, layout } = resolveBlockDesign(definition, widgetType);
    const meta = getWidgetMeta(widgetType);
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
                    blockClass(widgetType),
                    layout.props?.className,
                ]
                    .filter(Boolean)
                    .join(" "),
                "data-widget": widgetType,
                ...(ctx.isEditing ? { "data-block-id": block.id } : {}),
            },
        };
        return (_jsx(NodeRenderer, { node: blockLayout, content: { [block.id]: content, _design: mergedDesign }, 
            // widgetLayout lets carousel slides mirror the list item, exactly as
            // the template widget does in the builder.
            ctx: { ...ctx, selfData: content, widgetLayout: layout } }));
    }
    // 2. Specialized Widget renderer fallback ONLY if no layout exists
    const Widget = WIDGET_RENDERERS[widgetType];
    if (Widget) {
        return (_jsx("div", { className: blockClass(widgetType), "data-widget": widgetType, "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: "100%", boxSizing: "border-box" }, children: _jsx(Widget, { content: content, design: mergedDesign, cls: (part) => `p-${part}`, ctx: ctx }) }));
    }
    return (_jsx("div", { className: blockClass(widgetType), "data-block-id": ctx.isEditing ? block.id : undefined, style: { width: "100%", boxSizing: "border-box" }, children: ctx.isEditing ? `Unknown widget: ${block.widget}` : null }));
}
