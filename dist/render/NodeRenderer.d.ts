import React from "react";
import type { Node } from "../types/node";
export interface RenderCtx {
    card: any;
    links: any[];
    blocks?: any[];
    isEditing?: boolean;
    gatedWidgetKeys?: string[];
    track: (event: any) => void;
    selfData?: any;
}
export interface NodeRendererProps {
    node: Node;
    content: any;
    ctx: RenderCtx;
}
export declare function NodeRenderer({ node, content, ctx }: NodeRendererProps): React.JSX.Element | null;
