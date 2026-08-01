import React from 'react';
import type { BlockInstance, CardTheme } from '../types/block';
import type { TemplateDefinition } from '../types/definition';
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
export declare function CardRenderer({ definition, content, card, links, isEditing, gatedWidgetKeys, onTrack, onActionClick, blocks, theme, }: CardRendererProps): React.JSX.Element;
