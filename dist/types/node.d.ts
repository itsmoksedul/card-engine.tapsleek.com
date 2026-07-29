/**
 * Node types — the template tree.
 *
 * Three kinds only:
 *   element  pure design primitive, never user-editable
 *   widget   composite, data-driven, the ONLY user-editable unit
 *   slot     a region where the user may add widgets from a whitelist
 *
 * A node's `id` doubles as its CSS class (`.n<id>`), which is how a locked
 * design and a shared component can produce completely different looks.
 */
import type { StyleSet } from './style';
/** Tags an admin can place. Layout containers accept children; leaves don't. */
export type PrimitiveTag = 'frame' | 'stack' | 'grid' | 'heading' | 'text' | 'richtext' | 'image' | 'icon' | 'button' | 'link' | 'divider' | 'spacer';
export declare const CONTAINER_TAGS: PrimitiveTag[];
export declare const VOID_TAGS: PrimitiveTag[];
/**
 * Native card behaviours an admin can wire onto any `button`/`link`, replacing
 * the hardcoded "SAVE AS CONTACT" button in the old renderer.
 */
export type NodeAction = 'link' | 'vcard' | 'share' | 'qr' | 'popup' | 'scroll-to' | 'copy';
/** Card fields a node can pull its value from. */
export type CardField = 'fullName' | 'firstName' | 'lastName' | 'bio' | 'jobTitle' | 'companyName' | 'location' | 'profileImage' | 'coverPhoto' | 'companyLogo' | 'publicUrl' | 'vcardUrl' | 'qrUrl' | 'shareUrl';
export declare const CARD_FIELDS: CardField[];
/**
 * Where a primitive gets its value. This is what removes the hardcoded
 * `Header()` component — an admin composes a header from primitives and binds
 * each one to a card field.
 */
export type Binding = {
    source: 'card';
    field: CardField;
} | {
    source: 'widget';
    key: string;
    path: string;
} | {
    source: 'self';
    path: string;
} | {
    source: 'token';
    path: string;
};
export interface NodeA11y {
    role?: string;
    label?: string;
}
export interface BaseNode {
    /** Stable, unique within the template. Compiles to the CSS class `.n<id>`. */
    id: string;
    /** Layers-panel label. Cosmetic. */
    name?: string;
    style?: StyleSet;
    /** Per-breakpoint hiding, compiled to `display:none` in the right media query. */
    hidden?: Partial<Record<'base' | 'sm' | 'md', boolean>>;
    a11y?: NodeA11y;
}
export interface ElementNode extends BaseNode {
    kind: 'element';
    tag: PrimitiveTag;
    props?: Record<string, unknown>;
    /** Pull the rendered value from the card instead of `props`. */
    bind?: Binding;
    /** A bound value that resolves empty removes the node entirely (no gap). */
    hideIfEmpty?: boolean;
    children?: Node[];
}
export interface WidgetNode extends BaseNode {
    kind: 'widget';
    /** The type key matching a registered WidgetMeta (e.g. 'CTA_BUTTON'). */
    widget: string;
    /**
     * The user-entered content for this widget, keyed by the parts defined in
     * its schema.
     */
    content?: Record<string, unknown>;
    /**
     * Designer-authored internal structure. When present, the widget renders by
     * walking this subtree with NodeRenderer instead of its hardcoded component.
     * Leaves bind to this widget's own content via { source:'self'|'widget', ... }.
     * Absent => legacy hardcoded render (hybrid model).
     */
    layout?: ElementNode;
    /** Stable content address — `card.content[key]`. Unique within a template. */
    key: string;
    /** Semantic tag used to carry content across a template switch. */
    role?: string;
    /** What the USER sees in their editor list. */
    label: string;
    /** Admin-locked design props (validated against the widget's designSchema). */
    design?: Record<string, unknown>;
    /** Subset of `design` keys the user is allowed to change. */
    userOptions?: string[];
    /** Show a visibility toggle to the user. */
    userCanHide?: boolean;
    /** false = decorative; hidden from the user's editor entirely. */
    editable?: boolean;
    /** Demo content shipped with the template, used until the user edits. */
    defaultContent?: Record<string, unknown>;
    /** Styles for the widget's named inner parts → `.n<id> .p-<part>`. */
    partStyles?: Record<string, StyleSet>;
}
export interface SlotNode extends BaseNode {
    kind: 'slot';
    key: string;
    label: string;
    /** Widget types the user may add here. */
    allow: string[];
    max?: number;
    /**
     * Per-type design + part styles applied to anything the user adds, so a
     * user-added widget still looks like it belongs to this template.
     */
    presets?: Record<string, {
        design?: Record<string, unknown>;
        partStyles?: Record<string, StyleSet>;
    }>;
}
export type Node = ElementNode | WidgetNode | SlotNode;
export declare function isElement(n: Node): n is ElementNode;
export declare function isWidget(n: Node): n is WidgetNode;
export declare function isSlot(n: Node): n is SlotNode;
/** Depth-first walk over the tree. `parent` is null for the root. */
export declare function walkNodes(root: Node, visit: (node: Node, parent: Node | null, depth: number) => void): void;
/** Every widget node in tree order. */
export declare function collectWidgets(root: Node): WidgetNode[];
/** Every slot node in tree order. */
export declare function collectSlots(root: Node): SlotNode[];
/** Depth-first walk that preserves document order (unlike the stack version). */
export declare function walkTreeOrder(node: Node, visit: (node: Node, depth: number) => void, depth?: number): void;
export declare function findNode(root: Node, id: string): Node | null;
export declare function countNodes(root: Node): number;
export declare function maxDepth(root: Node): number;
