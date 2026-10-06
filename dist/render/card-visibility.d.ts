import type { Node, WidgetNode } from '../types/node';
/**
 * Widgets driven by card data (profile, links, vcard…). Every other widget is
 * an optional block: on a user card it only renders through the user's blocks.
 */
export declare const CORE_WIDGETS: Set<string>;
export declare function isCoreWidget(widget: string | undefined): boolean;
/** The slice of the render context the visibility rules read. */
export interface VisibilityCtx {
    links?: any[];
    blocks?: any[];
    isEditing?: boolean;
    gatedWidgetKeys?: string[];
    placeholderId?: string | null;
    injectBefore?: boolean;
    isRenderingUserBlocks?: boolean;
}
/**
 * True when a template widget renders nothing on a user card: an optional
 * widget that isn't hosting the user's blocks, or a links/social widget with
 * nothing to show. Builder canvas and template previews (no `blocks`) always
 * render every widget.
 */
export declare function isWidgetHiddenOnCard(node: WidgetNode, ctx: VisibilityCtx): boolean;
/**
 * Ids of template elements that would render as empty chrome on a user card.
 *
 * Hiding an unused widget leaves its wrapping section frame behind — padding,
 * background and radius with nothing inside: a blank box. A container is
 * collapsed when it held at least one hidden widget and nothing else that
 * still carries content (a visible widget, a slot, a bound element, a
 * button/link). Purely decorative leftovers (a static "Section title"
 * heading, an icon, a divider) go with it. The root is never collapsed.
 */
export declare function collectCollapsedIds(root: Node, ctx: VisibilityCtx): Set<string> | undefined;
