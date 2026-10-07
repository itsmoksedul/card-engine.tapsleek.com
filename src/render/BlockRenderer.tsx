import React from 'react';
import type { TemplateDefinition } from '../types/definition';
import type { BlockInstance } from '../types/block';
import { resolveBlockDesign, blockClass } from '../blocks/resolve-design';
import { getWidgetMeta, normalizeWidgetType } from '../widgets/registry';
import { WIDGET_RENDERERS } from './widgets';
import { NodeRenderer, type RenderCtx } from './NodeRenderer';

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
  const rawType = block.widget || (block as any).type || '';
  const widgetType = normalizeWidgetType(rawType);
  const Widget = WIDGET_RENDERERS[widgetType as keyof typeof WIDGET_RENDERERS] as any;
  const { design, layout } = resolveBlockDesign(definition, widgetType);
  const meta = getWidgetMeta(widgetType);
  const content = (block.content as Record<string, unknown>) ?? meta?.defaultContent ?? {};
  const mergedDesign = { ...(design || {}), ...(content || {}) };

  if (layout) {
    return (
      <div
        className={blockClass(block.widget)}
        data-widget={block.widget}
        data-block-id={ctx.isEditing ? block.id : undefined}
      >
        <NodeRenderer
          node={layout}
          content={{ [block.id]: content, _design: mergedDesign }}
          ctx={{ ...ctx, selfData: content }}
        />
      </div>
    );
  }

  if (!Widget) {
    return (
      <div
        className={blockClass(block.widget)}
        data-block-id={ctx.isEditing ? block.id : undefined}
      >
        {ctx.isEditing ? `Unknown widget: ${block.widget}` : null}
      </div>
    );
  }

  return (
    <div
      className={blockClass(block.widget)}
      data-widget={block.widget}
      data-block-id={ctx.isEditing ? block.id : undefined}
    >
      <Widget content={content} design={design} cls={(part: string) => `p-${part}`} ctx={ctx} />
    </div>
  );
}
