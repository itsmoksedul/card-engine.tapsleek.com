import React from 'react';
import type { TemplateDefinition } from '../types/definition';
import type { BlockInstance, CardTheme } from '../types/block';
export interface CardRendererProps {
    definition: TemplateDefinition;
    content: any;
    card: any;
    links: any[];
    isEditing?: boolean;
    gatedWidgetKeys?: string[];
    onTrack?: (event: any) => void;
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
export declare function CardRenderer({ definition, content, card, links, isEditing, gatedWidgetKeys, onTrack, blocks, theme, }: CardRendererProps): React.JSX.Element;
