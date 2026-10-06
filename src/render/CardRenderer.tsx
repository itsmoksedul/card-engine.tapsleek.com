import React from 'react';
import type { BlockInstance, CardTheme } from '../types/block';
import type { TemplateDefinition } from '../types/definition';
import { isWidget, walkNodes } from '../types/node';
import { BlockRenderer } from './BlockRenderer';
import { collectCollapsedIds, isCoreWidget } from './card-visibility';
import { NodeRenderer, type RenderCtx } from './NodeRenderer';

export interface CardRendererProps {
  definition: TemplateDefinition;
  content: any;
  card: any;
  links: any[];
  isEditing?: boolean;
  gatedWidgetKeys?: string[];
  onTrack?: (event: any) => void;
  onActionClick?: (action: string) => void;
  blocks?: BlockInstance[];
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
  const placeholder = React.useMemo(() => {
    if (isEditing || !blocks || blocks.length === 0) return null;
    let optionalId: string | null = null;
    let copyrightId: string | null = null;
    walkNodes(definition.root, (n) => {
      if (optionalId) return;
      if (isWidget(n)) {
        const w = (n.widget || '').toUpperCase();
        if (w === 'COPYRIGHT' && !copyrightId) {
          copyrightId = n.id;
        }
        // Same core list the widget renderer uses — a widget it treats as core
        // (e.g. VCARD_BUTTON) must never be picked to host the user's blocks.
        if (!isCoreWidget(w)) optionalId = n.id;
      }
    });
    if (optionalId) return { id: optionalId, injectBefore: false };
    if (copyrightId) return { id: copyrightId, injectBefore: true };
    return null;
  }, [definition.root, isEditing, blocks]);

  // Section frames left empty once unused widgets are hidden (blank boxes).
  const collapsedIds = React.useMemo(
    () =>
      collectCollapsedIds(definition.root, {
        links,
        blocks,
        isEditing,
        gatedWidgetKeys,
        placeholderId: placeholder?.id || null,
        injectBefore: placeholder?.injectBefore || false,
      }),
    [definition.root, links, blocks, isEditing, gatedWidgetKeys, placeholder],
  );

  const ctx: RenderCtx = {
    card: { ...card, links: links ?? card?.links },
    links,
    blocks,
    isEditing,
    gatedWidgetKeys,
    track: onTrack || (() => {}),
    onActionClick,
    rootId: definition.root.id,
    placeholderId: placeholder?.id || null,
    injectBefore: placeholder?.injectBefore || false,
    collapsedIds,
    renderUserBlocks: () => {
      if (!blocks || blocks.length === 0) return null;
      const blockCtx: RenderCtx = {
        ...ctx,
        renderUserBlocks: undefined,
        isRenderingUserBlocks: true,
        collapsedIds: undefined,
      };
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
                  ctx={blockCtx}
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
