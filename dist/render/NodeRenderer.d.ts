import React from "react";
import type { ElementNode, Node } from "../types/node";
export interface RenderCtx {
    card: any;
    links: any[];
    blocks?: any[];
    /** Template node id → the user's blocks rendered in that node's place. */
    blockNodeMap?: Map<string, any[]>;
    renderBlocks?: (blocks: any[]) => React.ReactNode;
    /** node.id → block.position — used to sort widget siblings in user-order */
    blockPositionMap?: Map<string, number>;
    renderBlock?: (block: any) => React.ReactNode;
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
    /**
     * Template layers that are the source of a custom block. Like optional
     * widgets, on a user card they only render through the user's blocks.
     */
    customBlockSourceIds?: Set<string>;
    isCarouselSlide?: boolean;
    carouselPerView?: number;
}
export interface NodeRendererProps {
    node: Node;
    content: any;
    ctx: RenderCtx;
}
export declare function NodeRenderer({ node, content, ctx }: NodeRendererProps): React.JSX.Element | null;
export declare const CarouselContext: React.Context<{
    viewportRef?: React.RefObject<HTMLDivElement | null>;
    trackRef?: React.RefObject<HTMLDivElement | null>;
    selectedIndex?: number;
    canScrollPrev?: boolean;
    canScrollNext?: boolean;
    loop?: boolean;
    isInfinite?: boolean;
    perView?: number;
    originalSlideCount?: number;
    scrollNext?: () => void;
    scrollPrev?: () => void;
    scrollTo?: (idx: number) => void;
    dragProps?: Record<string, any>;
} | null>;
/** YouTube's own thumbnail for a video URL, or "" for anything else. */
export declare function videoThumbnailUrl(url: string): string;
/**
 * Structure comes from the widget's code, not the stored copy: the builder
 * never edits a layout node's tag/binding, so a stored layout only diverges
 * from the default when the default was fixed later. Taking these from the
 * default lets such fixes reach templates saved before them; style, props and
 * hidden stay the instance's (that is what the admin edits).
 */
export declare function structuralFrom(def: ElementNode): Partial<ElementNode>;
export declare function mergeLayoutTrees(instance: ElementNode, defaultLayout: ElementNode): ElementNode;
