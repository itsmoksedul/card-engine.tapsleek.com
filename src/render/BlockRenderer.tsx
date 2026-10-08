import { blockClass, resolveBlockDesign } from "../blocks/resolve-design";
import type { BlockInstance } from "../types/block";
import type { TemplateDefinition } from "../types/definition";
import { getWidgetMeta, normalizeWidgetType } from "../widgets/registry";
import { NodeRenderer, type RenderCtx } from "./NodeRenderer";
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
export function BlockRenderer({
  definition,
  block,
  ctx,
}: {
  definition: TemplateDefinition;
  block: BlockInstance;
  ctx: RenderCtx;
}) {
  const rawType = block.widget || (block as any).type || "";

  // 0. Template Custom Block (authored from Layer Groups in Admin)
  const customBlock = definition.customBlocks?.find(
    (cb) =>
      cb.id === rawType ||
      cb.id === block.widget ||
      cb.id === (block as any).type,
  );

  if (customBlock) {
    const blockContent =
      (block.content as Record<string, unknown>) ??
      customBlock.defaultContent ??
      {};
    const safeLayout =
      customBlock.layout.id === "root"
        ? { ...customBlock.layout, id: `${customBlock.id}-root` }
        : customBlock.layout;

    const nodeContentMap: Record<string, any> = {};
    for (const f of customBlock.fields ?? []) {
      const val = blockContent[f.key];
      if (val !== undefined) {
        nodeContentMap[f.nodeId] = val;
        nodeContentMap[f.key] = val;
      }
    }

    const mergedData = {
      ...nodeContentMap,
      ...blockContent,
    };

    return (
      <div
        className={blockClass(customBlock.id)}
        data-widget={customBlock.id}
        data-custom-block="true"
        data-block-id={ctx.isEditing ? block.id : undefined}
        style={{ width: "100%", boxSizing: "border-box" }}
      >
        <NodeRenderer
          node={safeLayout}
          content={{ [block.id]: blockContent, ...mergedData }}
          ctx={{ ...ctx, selfData: mergedData }}
        />
      </div>
    );
  }

  const widgetType = normalizeWidgetType(rawType);
  const Widget = WIDGET_RENDERERS[
    widgetType as keyof typeof WIDGET_RENDERERS
  ] as any;
  const { design, layout, hasCustomLayout } = resolveBlockDesign(
    definition,
    widgetType,
  );
  const meta = getWidgetMeta(widgetType);
  const content =
    (block.content as Record<string, unknown>) ?? meta?.defaultContent ?? {};
  const mergedDesign = { ...(design || {}), ...(content || {}) };

  // 1. If the template explicitly defined a custom layout tree for this widget instance, render it:
  if (hasCustomLayout && layout) {
    const safeLayout =
      layout.id === "root"
        ? { ...layout, id: `${widgetType.toLowerCase()}-root` }
        : layout;
    return (
      <div
        className={blockClass(block.widget)}
        data-widget={block.widget}
        data-block-id={ctx.isEditing ? block.id : undefined}
        style={{ width: "100%", boxSizing: "border-box" }}
      >
        <NodeRenderer
          node={safeLayout}
          content={{ [block.id]: content, _design: mergedDesign }}
          ctx={{ ...ctx, selfData: content }}
        />
      </div>
    );
  }

  // 2. Specialized Widget renderer (Video with YouTube iframe, Map, Title, Description, etc.)
  if (Widget) {
    return (
      <div
        className={blockClass(block.widget)}
        data-widget={block.widget}
        data-block-id={ctx.isEditing ? block.id : undefined}
        style={{ width: "100%", boxSizing: "border-box" }}
      >
        <Widget
          content={content}
          design={mergedDesign}
          cls={(part: string) => `p-${part}`}
          ctx={ctx}
        />
      </div>
    );
  }

  // 3. Fallback to defaultLayout if no specialized Widget renderer exists
  if (layout) {
    const safeLayout =
      layout.id === "root"
        ? { ...layout, id: `${widgetType.toLowerCase()}-root` }
        : layout;
    return (
      <div
        className={blockClass(block.widget)}
        data-widget={block.widget}
        data-block-id={ctx.isEditing ? block.id : undefined}
        style={{ width: "100%", boxSizing: "border-box" }}
      >
        <NodeRenderer
          node={safeLayout}
          content={{ [block.id]: content, _design: mergedDesign }}
          ctx={{ ...ctx, selfData: content }}
        />
      </div>
    );
  }

  return (
    <div
      className={blockClass(block.widget)}
      data-block-id={ctx.isEditing ? block.id : undefined}
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      {ctx.isEditing ? `Unknown widget: ${block.widget}` : null}
    </div>
  );
}
