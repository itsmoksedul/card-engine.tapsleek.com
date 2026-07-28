import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import type { ElementNode, Node, SlotNode, WidgetNode } from '../types/node';
import { resolveBinding } from './resolveBinding';
import { WIDGET_RENDERERS } from './widgets';

export interface RenderCtx {
  card: any;
  links: any[];
  isEditing?: boolean;
  gatedWidgetKeys?: string[];
  track: (event: any) => void;
}

export interface NodeRendererProps {
  node: Node;
  content: any;
  ctx: RenderCtx;
}

export function NodeRenderer({ node, content, ctx }: NodeRendererProps) {
  if (node.kind === 'element') return <ElementRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === 'widget') return <WidgetRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === 'slot') return <SlotRenderer node={node} content={content} ctx={ctx} />;
  return null;
}

// ─── Elements ────────────────────────────────────────────────────────────────

const TAG_MAP: Record<string, string> = {
  frame: 'div',
  stack: 'div',
  grid: 'div',
  text: 'p',
  richtext: 'div',
  image: 'img',
  icon: 'span',
  button: 'button',
  link: 'a',
  divider: 'hr',
  spacer: 'div',
};

/**
 * Props that configure the ENGINE, not the DOM.
 *
 * These must never reach an HTML element: React forwards unknown attributes
 * verbatim, so spreading `node.props` produced `<p text="…">` and
 * `<img fit="cover">` — invalid HTML plus a console warning per node.
 */
const ENGINE_PROPS = new Set([
  'text', 'html', 'level', 'as', 'fit', 'ratio', 'action', 'popup',
  'label', 'name', 'size', 'icon', 'loading',
]);

function ElementRenderer({
  node,
  content,
  ctx,
}: {
  node: ElementNode;
  content: any;
  ctx: RenderCtx;
}) {
  const bound = resolveBinding(node.bind, ctx.card, content);
  const props = (node.props ?? {}) as Record<string, any>;

  // A bound node that resolves empty disappears entirely — that's what stops an
  // absent bio leaving a gap in the layout.
  if (node.hideIfEmpty && isEmpty(bound)) return null;

  const tag =
    node.tag === 'frame'
      ? (props.as as string) || 'div'
      : node.tag === 'heading'
        ? `h${clampLevel(props.level)}`
        : TAG_MAP[node.tag] || 'div';

  const dom: Record<string, any> = { className: `n${node.id}` };

  // Only forward attributes the DOM actually understands.
  for (const [key, value] of Object.entries(props)) {
    if (ENGINE_PROPS.has(key)) continue;
    dom[key] = value;
  }

  if (ctx.isEditing) dom['data-node-id'] = node.id;
  if (node.a11y?.role) dom.role = node.a11y.role;
  if (node.a11y?.label) dom['aria-label'] = node.a11y.label;

  let children: React.ReactNode = null;

  switch (node.tag) {
    case 'image': {
      dom.src = bound ?? props.src ?? '';
      dom.alt = props.alt ?? '';
      dom.loading = props.loading ?? 'lazy';
      if (!dom.src) return ctx.isEditing ? <span {...dom} data-empty="true" /> : null;
      break;
    }
    case 'icon': {
      dom['data-icon'] = props.name ?? '';
      dom['aria-hidden'] = true;
      break;
    }
    case 'heading':
    case 'text': {
      children = bound ?? props.text ?? '';
      break;
    }
    case 'richtext': {
      const rawHtml = bound ?? props.html ?? '';
      dom.dangerouslySetInnerHTML = { __html: DOMPurify.sanitize(String(rawHtml)) };
      break;
    }
    case 'button':
    case 'link': {
      const action = (props.action as string) || 'link';
      dom['data-action'] = action;
      if (action === 'link') {
        const href = bound ?? props.href;
        if (node.tag === 'link') dom.href = href || '#';
        else if (href) dom.onClick = () => window.open(String(href), props.target || '_self');
      } else if (action === 'popup') {
        dom['data-popup'] = props.popup ?? '';
      }
      if (node.tag === 'button') dom.type = 'button';
      children = props.label ?? null;
      break;
    }
    case 'divider':
    case 'spacer':
      // Void — never given children, so React doesn't complain about hr/img.
      return React.createElement(tag, dom);
    default:
      break;
  }

  return React.createElement(
    tag,
    dom,
    node.tag === 'richtext' ? undefined : (
      <>
        {children}
        {node.children?.map((child) => (
          <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
        ))}
      </>
    ),
  );
}

// ─── Widgets ─────────────────────────────────────────────────────────────────

/**
 * The wrapper element IS the node.
 *
 * It carries `n<id>`, so the node's own style lands on it, and `cls()` returns
 * only `p-<part>`. That separation matters: when every part also carried
 * `n<id>`, a node-level `background` painted itself onto every inner element of
 * the widget, and `.n<id> .p-root` could never match at all.
 */
function GatedWidgetUpsell({ node, ctx }: { node: WidgetNode; ctx: RenderCtx }) {
  return (
    <div
      className={`n${node.id} ts-gated-upsell`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      data-gated="true"
      style={{
        padding: '16px',
        borderRadius: '8px',
        border: '1px dashed #cbd5e1',
        background: '#f8fafc',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Pro Feature
      </div>
      <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
        {node.label || node.widget} is locked on current plan
      </div>
    </div>
  );
}

function WidgetRenderer({
  node,
  content,
  ctx,
}: {
  node: WidgetNode;
  content: any;
  ctx: RenderCtx;
}) {
  const isGated =
    ctx.gatedWidgetKeys?.includes(node.key) || ctx.gatedWidgetKeys?.includes(node.widget);

  if (isGated && !ctx.isEditing) {
    return <GatedWidgetUpsell node={node} ctx={ctx} />;
  }

  const Widget = WIDGET_RENDERERS[node.widget as keyof typeof WIDGET_RENDERERS] as any;

  if (!Widget) {
    return (
      <div className={`n${node.id}`} data-node-id={ctx.isEditing ? node.id : undefined}>
        {ctx.isEditing ? `Unknown widget: ${node.widget}` : null}
      </div>
    );
  }

  const widgetContent = content?.[node.key] ?? node.defaultContent ?? {};

  return (
    <div
      className={`n${node.id}`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      data-widget={node.widget}
    >
      <Widget
        content={widgetContent}
        design={node.design ?? {}}
        cls={(part: string) => `p-${part}`}
        ctx={ctx}
      />
    </div>
  );
}

// ─── Slots ───────────────────────────────────────────────────────────────────

function SlotRenderer({ node, content, ctx }: { node: SlotNode; content: any; ctx: RenderCtx }) {
  const items: any[] = content?.[node.key]?.items ?? [];

  return (
    <div
      className={`n${node.id}`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      data-slot={node.key}
      data-empty={items.length === 0 ? 'true' : undefined}
    >
      {items.map((item, i) => (
        <NodeRenderer key={item.id ?? i} node={item} content={content} ctx={ctx} />
      ))}
      {ctx.isEditing && items.length === 0 && `Empty slot: ${node.label || node.key}`}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function clampLevel(level: unknown): number {
  const n = Number(level);
  return Number.isFinite(n) && n >= 1 && n <= 6 ? Math.floor(n) : 2;
}
