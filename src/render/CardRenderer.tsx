import React from 'react';
import type { BlockInstance, CardTheme } from '../types/block';
import type { TemplateDefinition } from '../types/definition';
import { isWidget, walkNodes } from '../types/node';
import { normalizeWidgetType } from '../widgets/registry';
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
  showPlaceholders?: boolean;
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
  showPlaceholders,
}: CardRendererProps) {
  const effectiveShowPlaceholders = Boolean(
    showPlaceholders ?? card?.showPlaceholders ?? isEditing,
  );

  const customBlockSourceIds = React.useMemo(() => {
    const ids = (definition.customBlocks ?? [])
      .filter((cb) => !cb.libraryId)
      .map((cb) => cb.sourceNodeId)
      .filter((id): id is string => Boolean(id));
    return ids.length ? new Set(ids) : undefined;
  }, [definition.customBlocks]);

  const placeholder = React.useMemo(() => {
    if (isEditing || !blocks || blocks.length === 0) return null;
    let optionalId: string | null = null;
    let optionalIsSource = false;
    let copyrightId: string | null = null;
    // Tree order. A custom block's source group is itself an optional
    // section (it only renders through the user's blocks), so it can host
    // them — but never what is inside it: that subtree is hidden on a card,
    // and a placeholder in there swallowed every user block.
    const visit = (n: any) => {
      if (optionalId || !n) return;
      if (customBlockSourceIds?.has(n.id)) {
        optionalId = n.id;
        optionalIsSource = true;
        return;
      }
      if (isWidget(n)) {
        const w = (n.widget || '').toUpperCase();
        if (w === 'COPYRIGHT' && !copyrightId) {
          copyrightId = n.id;
        }
        if (!isCoreWidget(w)) optionalId = n.id;
        return;
      }
      (n.children ?? []).forEach(visit);
    };
    visit(definition.root);
    // A hidden source group can't render blocks in its place, so they go
    // right before it instead.
    if (optionalId) return { id: optionalId, injectBefore: optionalIsSource };

    // If no non-core widget exists, check if root's children contains a footer frame with COPYRIGHT
    const rootChildren = (definition.root as any)?.children || [];
    for (const child of rootChildren) {
      if (child.id === copyrightId) {
        return { id: child.id, injectBefore: true };
      }
      let hasCopyright = false;
      walkNodes(child, (cn) => {
        if (isWidget(cn) && (cn.widget || '').toUpperCase() === 'COPYRIGHT') {
          hasCopyright = true;
        }
      });
      if (hasCopyright) {
        return { id: child.id, injectBefore: true };
      }
    }

    if (copyrightId) return { id: copyrightId, injectBefore: true };
    return null;
  }, [definition.root, isEditing, blocks, customBlockSourceIds]);

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
        showPlaceholders: effectiveShowPlaceholders,
        customBlockSourceIds,
      }),
    [
      definition.root,
      links,
      blocks,
      isEditing,
      gatedWidgetKeys,
      placeholder,
      effectiveShowPlaceholders,
      customBlockSourceIds,
    ],
  );

  const ctx: RenderCtx = {
    card: {
      ...card,
      showPlaceholders: effectiveShowPlaceholders,
      links: links ?? card?.links,
    },
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
    customBlockSourceIds,
    renderBlock: (block: BlockInstance) => {
      const normalizedBlock: BlockInstance = {
        ...block,
        widget: normalizeWidgetType(block.widget || (block as any).type),
      };
      return (
        <BlockRenderer
          key={block.id}
          definition={definition}
          block={normalizedBlock}
          ctx={{
            ...ctx,
            renderUserBlocks: undefined,
            isRenderingUserBlocks: true,
            collapsedIds: undefined,
          }}
        />
      );
    },
    renderUserBlocks: () => {
      if (!blocks || blocks.length === 0) return null;
      const blockCtx: RenderCtx = {
        ...ctx,
        renderUserBlocks: undefined,
        isRenderingUserBlocks: true,
        collapsedIds: undefined,
      };
      const activeBlocks = [...blocks]
        .filter((b) => b.hidden !== true && (b as any).isVisible !== false)
        .sort((a, b) => ((a as any).position ?? 0) - ((b as any).position ?? 0));

      return (
        <React.Fragment>
          {activeBlocks.map((b) => {
            const normalizedBlock: BlockInstance = {
              ...b,
              widget: normalizeWidgetType(b.widget || (b as any).type),
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
