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

  // The user's visible blocks, in their chosen order.
  const activeBlocks = React.useMemo(
    () =>
      [...(blocks ?? [])]
        .filter((b) => b.hidden !== true && (b as any).isVisible !== false)
        .sort(
          (a, b) => ((a as any).position ?? 0) - ((b as any).position ?? 0),
        ),
    [blocks],
  );

  /**
   * Where each block renders. A block goes where the admin designed its kind
   * in the template — a custom widget at its source layer group, a preset at
   * the template's first widget of that type — so a card follows the
   * template's sections (a widget placed outside the main section stays
   * outside). Blocks with no such spot ("loose") go to the default
   * placeholder below. Several blocks at one spot keep the user's order.
   */
  const anchoring = React.useMemo(() => {
    if (isEditing || !activeBlocks.length) return null;
    const typeAnchor = new Map<string, string>();
    const presentSources = new Set<string>();
    const visit = (n: any) => {
      if (!n) return;
      if (customBlockSourceIds?.has(n.id)) {
        presentSources.add(n.id);
        return;
      }
      if (isWidget(n)) {
        const w = normalizeWidgetType(n.widget || '').toUpperCase();
        if (!isCoreWidget(w) && !typeAnchor.has(w)) typeAnchor.set(w, n.id);
        return;
      }
      (n.children ?? []).forEach(visit);
    };
    visit(definition.root);

    const sourceAnchor = new Map<string, string>();
    for (const cb of definition.customBlocks ?? []) {
      if (
        !cb.libraryId &&
        cb.sourceNodeId &&
        presentSources.has(cb.sourceNodeId)
      ) {
        sourceAnchor.set(cb.id, cb.sourceNodeId);
      }
    }

    const byNode = new Map<string, BlockInstance[]>();
    const loose: BlockInstance[] = [];
    for (const b of activeBlocks) {
      const raw = String(b.widget || (b as any).type || '');
      const anchor =
        sourceAnchor.get(raw) ??
        typeAnchor.get(normalizeWidgetType(raw).toUpperCase());
      if (!anchor) {
        loose.push(b);
        continue;
      }
      const list = byNode.get(anchor) ?? [];
      list.push(b);
      byNode.set(anchor, list);
    }
    return { byNode, loose };
  }, [
    isEditing,
    activeBlocks,
    definition.root,
    definition.customBlocks,
    customBlockSourceIds,
  ]);

  const placeholder = React.useMemo(() => {
    // Only blocks without a designed spot need the default placeholder.
    if (isEditing || !anchoring || anchoring.loose.length === 0) return null;
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
  }, [definition.root, isEditing, anchoring, customBlockSourceIds]);

  /**
   * Final block spots. When the default placeholder is itself a designed spot
   * that it replaces (not injects before), the loose blocks join that spot's
   * blocks there, in user order — one render site per node.
   */
  const spots = React.useMemo(() => {
    const empty: BlockInstance[] = [];
    if (!anchoring) return { byNode: undefined, loose: empty, placeholder };
    const byNode = new Map(anchoring.byNode);
    let loose = anchoring.loose;
    let ph = placeholder;
    if (ph && !ph.injectBefore && byNode.has(ph.id)) {
      const order = new Map(activeBlocks.map((b, i) => [b.id, i]));
      byNode.set(
        ph.id,
        [...byNode.get(ph.id)!, ...loose].sort(
          (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
        ),
      );
      loose = empty;
      ph = null;
    }
    return {
      byNode: byNode.size ? byNode : undefined,
      loose,
      placeholder: ph,
    };
  }, [anchoring, placeholder, activeBlocks]);

  // Section frames left empty once unused widgets are hidden (blank boxes).
  const collapsedIds = React.useMemo(
    () =>
      collectCollapsedIds(definition.root, {
        links,
        blocks,
        blockNodeMap: spots.byNode,
        isEditing,
        gatedWidgetKeys,
        placeholderId: spots.placeholder?.id || null,
        injectBefore: spots.placeholder?.injectBefore || false,
        showPlaceholders: effectiveShowPlaceholders,
        customBlockSourceIds,
      }),
    [
      definition.root,
      links,
      blocks,
      spots,
      isEditing,
      gatedWidgetKeys,
      effectiveShowPlaceholders,
      customBlockSourceIds,
    ],
  );

  const renderList = (list: BlockInstance[]): React.ReactNode => {
    if (!list.length) return null;
    const blockCtx: RenderCtx = {
      ...ctx,
      renderUserBlocks: undefined,
      isRenderingUserBlocks: true,
      collapsedIds: undefined,
    };
    return (
      <React.Fragment>
        {list.map((b) => (
          <BlockRenderer
            key={b.id}
            definition={definition}
            block={{
              ...b,
              widget: normalizeWidgetType(b.widget || (b as any).type),
            }}
            ctx={blockCtx}
          />
        ))}
      </React.Fragment>
    );
  };

  const ctx: RenderCtx = {
    card: {
      ...card,
      showPlaceholders: effectiveShowPlaceholders,
      links: links ?? card?.links,
    },
    links,
    blocks,
    blockNodeMap: spots.byNode,
    isEditing,
    gatedWidgetKeys,
    track: onTrack || (() => {}),
    onActionClick,
    rootId: definition.root.id,
    placeholderId: spots.placeholder?.id || null,
    injectBefore: spots.placeholder?.injectBefore || false,
    collapsedIds,
    customBlockSourceIds,
    renderBlocks: renderList,
    renderBlock: (block: BlockInstance) => renderList([block]),
    renderUserBlocks: () => renderList(spots.loose),
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
