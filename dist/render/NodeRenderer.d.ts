import React from "react";
import type { ElementNode, Node } from "../types/node";
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
    /** Template elements that would be empty chrome on this card — skipped. */
    collapsedIds?: Set<string>;
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
/**
 * Structure comes from the widget's code, not the stored copy: the builder
 * never edits a layout node's tag/binding, so a stored layout only diverges
 * from the default when the default was fixed later. Taking these from the
 * default lets such fixes reach templates saved before them; style, props and
 * hidden stay the instance's (that is what the admin edits).
 */
export declare function structuralFrom(def: ElementNode): Partial<ElementNode>;
