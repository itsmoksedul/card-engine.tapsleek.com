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
    repeatIndex?: number;
    onActionClick?: (action: string) => void;
    renderUserBlocks?: () => React.ReactNode;
    rootId?: string;
    placeholderId?: string | null;
    injectBefore?: boolean;
    isRenderingUserBlocks?: boolean;
}
export interface NodeRendererProps {
    node: Node;
    content: any;
    ctx: RenderCtx;
}
export declare function NodeRenderer({ node, content, ctx }: NodeRendererProps): React.JSX.Element | null;
export declare const CarouselContext: React.Context<{
    emblaApi?: any;
    emblaRef?: any;
    selectedIndex?: number;
} | null>;
