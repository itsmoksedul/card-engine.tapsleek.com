import React from 'react';
import type { Node } from '../types/node';
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
export declare function NodeRenderer({ node, content, ctx }: NodeRendererProps): React.JSX.Element | null;
