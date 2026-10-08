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

  // Map user blocks to specific template widget nodes so separate boxes designed
  // in Admin builder are preserved and each block renders in its designated container.
  const { blockNodeMap, unmatchedBlocks, placeholder, blockPositionMap } = React.useMemo(() => {
    const map = new Map<string, BlockInstance>();
    if (isEditing || !blocks || blocks.length === 0) {
      return { blockNodeMap: map, unmatchedBlocks: [], placeholder: null, blockPositionMap: new Map<string, number>() };
    }

    const activeBlocks = [...blocks]
      .filter((b) => b.hidden !== true && (b as any).isVisible !== false)
      .sort((a, b) => ((a as any).position ?? 0) - ((b as any).position ?? 0));

    // Collect all widget nodes in the template
    const templateWidgets: { node: any; claimed: boolean }[] = [];
    walkNodes(definition.root, (n) => {
      if (isWidget(n)) {
        templateWidgets.push({ node: n, claimed: false });
      }
    });

    const remainingBlocks: BlockInstance[] = [];

    // Pass 1: Match by exact ID or key
    for (const b of activeBlocks) {
      const match = templateWidgets.find(
        (tw) =>
          !tw.claimed &&
          (tw.node.id === b.id ||
            tw.node.key === b.id ||
            (b as any).nodeId === tw.node.id),
      );
      if (match) {
        match.claimed = true;
        map.set(match.node.id, b);
      } else {
        remainingBlocks.push(b);
      }
    }

    // Pass 2: Match by widget type (for non-core widgets or custom blocks)
    const unmatched: BlockInstance[] = [];
    for (const b of remainingBlocks) {
      const rawType = b.widget || (b as any).type || "";
      const normType = normalizeWidgetType(rawType);
      const rawTypeLower = rawType.toLowerCase();
      const match = templateWidgets.find((tw) => {
        if (tw.claimed) return false;
        const twType = (tw.node.widget || "").toUpperCase();
        if (isCoreWidget(twType)) return false;
        // Case-insensitive match to handle custom blocks like "About Us" vs "about-us"
        return (
          normalizeWidgetType(tw.node.widget) === normType ||
          tw.node.widget === rawType ||
          tw.node.widget.toLowerCase() === rawTypeLower
        );
      });
      if (match) {
        match.claimed = true;
        map.set(match.node.id, b);
      } else {
        unmatched.push(b);
      }
    }

    // Pass 3: If any blocks remain unmatched, find a placeholder widget node
    let placeholderResult: { id: string; injectBefore: boolean } | null = null;
    if (unmatched.length > 0) {
      const unclaimedNonCore = templateWidgets.find(
        (tw) => !tw.claimed && !isCoreWidget(tw.node.widget),
      );
      if (unclaimedNonCore) {
        placeholderResult = {
          id: unclaimedNonCore.node.id,
          injectBefore: false,
        };
      } else {
        const copyrightWidget = templateWidgets.find(
          (tw) => (tw.node.widget || "").toUpperCase() === "COPYRIGHT",
        );
        if (copyrightWidget) {
          placeholderResult = {
            id: copyrightWidget.node.id,
            injectBefore: true,
          };
        }
      }
    }

    // Build a node.id → block.position map for widget children sorting
    const blockPositionMap = new Map<string, number>();
    for (const [nodeId, block] of map.entries()) {
      blockPositionMap.set(nodeId, (block as any).position ?? 0);
    }

    return {
      blockNodeMap: map,
      unmatchedBlocks: unmatched,
      placeholder: placeholderResult,
      blockPositionMap,
    };
  }, [definition.root, isEditing, blocks]);

  // Section frames left empty once unused widgets are hidden (blank boxes).
  const collapsedIds = React.useMemo(
    () =>
      collectCollapsedIds(definition.root, {
        links,
        blocks,
        blockNodeMap,
        isEditing,
        gatedWidgetKeys,
        placeholderId: placeholder?.id || null,
        injectBefore: placeholder?.injectBefore || false,
        showPlaceholders: effectiveShowPlaceholders,
      }),
    [
      definition.root,
      links,
      blocks,
      blockNodeMap,
      isEditing,
      gatedWidgetKeys,
      placeholder,
      effectiveShowPlaceholders,
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
    blockNodeMap,
    blockPositionMap,
    isEditing,
    gatedWidgetKeys,
    track: onTrack || (() => {}),
    onActionClick,
    rootId: definition.root.id,
    placeholderId: placeholder?.id || null,
    injectBefore: placeholder?.injectBefore || false,
    collapsedIds,
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
      if (!unmatchedBlocks || unmatchedBlocks.length === 0) return null;
      const blockCtx: RenderCtx = {
        ...ctx,
        renderUserBlocks: undefined,
        isRenderingUserBlocks: true,
        collapsedIds: undefined,
      };
      return (
        <React.Fragment>
          {unmatchedBlocks
            .filter((b) => b.hidden !== true && (b as any).isVisible !== false)
            .map((b) => {
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
