import React from 'react';
import type { TemplateDefinition } from '../types/definition';
import type { BlockInstance, CardTheme } from '../types/block';
import { NodeRenderer, type RenderCtx } from './NodeRenderer';
import { BlockRenderer } from './BlockRenderer';

export interface CardRendererProps {
  definition: TemplateDefinition;
  content: any;
  card: any;
  links: any[];
  isEditing?: boolean;
  gatedWidgetKeys?: string[];
  onTrack?: (event: any) => void;
  onActionClick?: (action: string) => void;
  /**
   * v2.1 — a user card renders its own ordered BLOCKS instead of the template's
   * node tree. Each block is styled by the template (via `tsb-<type>` presets);
   * the template still supplies the root frame's layout and the design tokens.
   * Omit `blocks` to render the template design directly (admin preview / a card
   * that has no composed content yet).
   */
  blocks?: BlockInstance[];
  /** v2.1 — the card owner's global theme; applied at the root. */
  theme?: CardTheme;
}

export function CardRenderer({
  definition,
  content,
  card,
  links,
  isEditing,
  gatedWidgetKeys,
  onTrack,
  onActionClick,
  blocks,
  theme,
}: CardRendererProps) {
  const ctx: RenderCtx = {
    card,
    links,
    blocks,
    isEditing,
    gatedWidgetKeys,
    track: onTrack || (() => {}),
    onActionClick,
    rootId: definition.root.id,
    _blocksInjected: { current: false },
    renderUserBlocks: () => {
      if (!blocks || blocks.length === 0) return null;
      return (
        <React.Fragment>
          {blocks
            .filter((b) => b.hidden !== true && (b as any).isVisible !== false)
            .map((b) => {
              const normalizedBlock: BlockInstance = {
                ...b,
                widget: b.widget || (b as any).type,
              };
              return (
                <BlockRenderer
                  key={b.id}
                  definition={definition}
                  block={normalizedBlock}
                  ctx={ctx} // Wait! `ctx` refers to the outer const, so it will work because JS hoists it
                />
              );
            })}
        </React.Fragment>
      );
    },
  };

  // ── Template design render (admin preview / public page from the tree) ──
  return (
    <div className="ts-card" style={themeRootStyle(theme)}>
      <NodeRenderer node={definition.root} content={content} ctx={ctx} />

      {definition.popups?.map((popup) => (
        <div key={popup.key} className="ts-popup" hidden>
          <NodeRenderer node={popup.root} content={content} ctx={ctx} />
        </div>
      ))}
    </div>
  );
}

/**
 * The two Theme knobs that aren't token overrides: font-weight and layout are
 * applied at the root here (the colour/font/radius/density vars come from
 * `compileCardTheme`, injected by the host in the `ts-override` layer).
 */
function themeRootStyle(theme: CardTheme | undefined): React.CSSProperties | undefined {
  if (!theme) return undefined;
  const style: React.CSSProperties = {};
  if (typeof theme.fontWeight === 'number') style.fontWeight = theme.fontWeight;
  if (theme.layout === 'center') style.textAlign = 'center';
  else if (theme.layout === 'left') style.textAlign = 'left';
  return Object.keys(style).length ? style : undefined;
}
