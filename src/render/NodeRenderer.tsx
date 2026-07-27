import React from 'react';
import type { Node, ElementNode, SlotNode, WidgetNode } from '../types/node';
import { resolveBinding } from './resolveBinding';
import { WIDGET_RENDERERS } from './widgets';

export interface RenderCtx {
  card: any;
  links: any[];
  isEditing?: boolean;
  track: (event: any) => void;
}

export interface NodeRendererProps {
  node: Node;
  content: any;
  ctx: RenderCtx;
}

export function NodeRenderer({ node, content, ctx }: NodeRendererProps) {
  if (node.kind === 'element') {
    return <ElementRenderer node={node} content={content} ctx={ctx} />;
  }
  
  if (node.kind === 'widget') {
    return <WidgetRenderer node={node} content={content} ctx={ctx} />;
  }

  if (node.kind === 'slot') {
    return <SlotRenderer node={node} content={content} ctx={ctx} />;
  }

  return null;
}

function ElementRenderer({ node, content, ctx }: { node: ElementNode, content: any, ctx: RenderCtx }) {
  const boundValue = resolveBinding(node.bind, ctx.card, content);
  
  if (node.hideIfEmpty && boundValue === undefined) {
    return null;
  }

  const Tag = (node.tag === 'frame' ? (node.props?.as as any || 'div') : 
               node.tag === 'heading' ? `h${node.props?.level || 2}` : 
               node.tag === 'text' ? 'p' : 
               node.tag === 'image' ? 'img' : 'div') as keyof JSX.IntrinsicElements | React.ComponentType<any>;

  const props: any = { ...node.props, className: `n${node.id}` };

  if (ctx.isEditing) {
    props['data-node-id'] = node.id;
    props.onClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.parent.postMessage({ type: 'SELECT_NODE', id: node.id }, '*');
    };
    props.className += ' cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-inset transition-all';
  }

  if (node.tag === 'image') {
    props.src = boundValue || props.src;
  } else if (node.tag === 'heading' || node.tag === 'text') {
    props.children = boundValue || props.text;
  }

  return (
    <Tag {...props}>
      {props.children}
      {node.children?.map(child => (
        <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
      ))}
    </Tag>
  );
}

function WidgetRenderer({ node, content, ctx }: { node: WidgetNode, content: any, ctx: RenderCtx }) {
  const WidgetComp = WIDGET_RENDERERS[node.widget as keyof typeof WIDGET_RENDERERS] as any;
  
  if (!WidgetComp) {
    return <div className={`n${node.id} p-root`}>Missing widget: {node.widget}</div>;
  }

  const widgetContent = content?.[node.key] ?? node.defaultContent;
  
  const handleSelect = ctx.isEditing ? (e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({ type: 'SELECT_NODE', id: node.id }, '*');
  } : undefined;

  return (
    <div 
      data-node-id={ctx.isEditing ? node.id : undefined}
      onClick={handleSelect}
      className={ctx.isEditing ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-inset transition-all' : ''}
    >
      <WidgetComp 
        content={widgetContent} 
        design={node.design} 
        cls={(part: string) => `n${node.id} p-${part}`} 
        ctx={ctx} 
      />
    </div>
  );
}

function SlotRenderer({ node, content, ctx }: { node: SlotNode, content: any, ctx: RenderCtx }) {
  const slotWidgets = content?.slots?.[node.key] || [];
  
  const handleSelect = ctx.isEditing ? (e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({ type: 'SELECT_NODE', id: node.id }, '*');
  } : undefined;

  return (
    <div 
      className={`n${node.id} ${ctx.isEditing ? 'cursor-pointer hover:ring-2 hover:ring-dashed hover:ring-green-500 hover:ring-inset p-4 bg-green-50/50' : ''}`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      onClick={handleSelect}
    >
      {slotWidgets.map((w: any) => (
        <NodeRenderer key={w.id} node={w} content={content} ctx={ctx} />
      ))}
      {ctx.isEditing && slotWidgets.length === 0 && (
        <div className="text-center text-sm text-green-700 font-medium">
          Empty Slot: {node.key}
        </div>
      )}
    </div>
  );
}
