import { blockClass, resolveBlockDesign } from "../blocks/resolve-design";
import type { BlockInstance } from "../types/block";
import type { TemplateDefinition } from "../types/definition";
import type { ElementNode } from "../types/node";
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

    const cbLayout = customBlock.layout as ElementNode;
    const blockLayout: ElementNode = {
      ...cbLayout,
      id:
        cbLayout.id === "root"
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

    return (
      <NodeRenderer
        node={blockLayout}
        content={{ [block.id]: blockContent, ...mergedData }}
        ctx={{ ...ctx, selfData: mergedData }}
      />
    );
  }

  const widgetType = normalizeWidgetType(rawType);
  const { design, layout } = resolveBlockDesign(
    definition,
    widgetType,
  );
  const meta = getWidgetMeta(widgetType);
  const content =
    (block.content as Record<string, unknown>) ?? meta?.defaultContent ?? {};
  const mergedDesign = { ...(design || {}), ...(content || {}) };

  // 1. If layout exists (either template instance layout or defaultLayout), render it directly!
  // This ensures identical DOM hierarchy, padding, margin, font-size, background as Admin!
  if (layout) {
    const blockLayout: ElementNode = {
      ...layout,
      id:
        layout.id === "root"
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

    return (
      <NodeRenderer
        node={blockLayout}
        content={{ [block.id]: content, _design: mergedDesign }}
        ctx={{ ...ctx, selfData: content }}
      />
    );
  }

  // 2. Specialized Widget renderer fallback ONLY if no layout exists
  const Widget = WIDGET_RENDERERS[
    widgetType as keyof typeof WIDGET_RENDERERS
  ] as any;
  if (Widget) {
    return (
      <div
        className={blockClass(widgetType)}
        data-widget={widgetType}
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

  return (
    <div
      className={blockClass(widgetType)}
      data-block-id={ctx.isEditing ? block.id : undefined}
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      {ctx.isEditing ? `Unknown widget: ${block.widget}` : null}
    </div>
  );
}
