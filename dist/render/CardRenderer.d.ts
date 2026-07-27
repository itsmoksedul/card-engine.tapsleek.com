import React from 'react';
import type { TemplateDefinition } from '../types/definition';
export interface CardRendererProps {
    definition: TemplateDefinition;
    content: any;
    card: any;
    links: any[];
    isEditing?: boolean;
    onTrack?: (event: any) => void;
}
export declare function CardRenderer({ definition, content, card, links, isEditing, onTrack }: CardRendererProps): React.JSX.Element;
