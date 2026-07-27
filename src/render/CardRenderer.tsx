import React from 'react';
import type { TemplateDefinition } from '../types/definition';
import { NodeRenderer, type RenderCtx } from './NodeRenderer';

export interface CardRendererProps {
  definition: TemplateDefinition;
  content: any;
  card: any;
  links: any[];
  isEditing?: boolean;
  onTrack?: (event: any) => void;
}

export function CardRenderer({ definition, content, card, links, isEditing, onTrack }: CardRendererProps) {
  const ctx: RenderCtx = {
    card,
    links,
    isEditing,
    track: onTrack || (() => {}),
  };

  return (
    <div className="ts-card">
      <NodeRenderer node={definition.root} content={content} ctx={ctx} />
      
      {/* Popups (e.g. Lead Capture) would be rendered here via portals or overlays */}
      {definition.popups?.map(popup => (
        <div key={popup.key} className="ts-popup" hidden>
          <NodeRenderer node={popup.root} content={content} ctx={ctx} />
        </div>
      ))}
    </div>
  );
}
