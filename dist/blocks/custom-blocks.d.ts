import type { Node } from "../types/node";
import type { CustomBlockField, TemplateCustomBlock, TemplateDefinition } from "../types/definition";
/**
 * Inspects an ElementNode (e.g. a Frame/Group) and discovers every child layer
 * that carries content (headings, texts, images, icons, videos, buttons,
 * links and inner widgets).
 *
 * The input is never mutated. `layout` is a clone where inner widgets are
 * flattened to elements and editor-only `self` bindings are removed — content
 * is applied by writing each field's value into `props[field.prop]` at render
 * time (see `applyCustomBlockContent`).
 *
 * Pass `previous` (a block's existing fields) to keep keys, labels and the
 * "user can edit" flag stable across re-syncs, so content already saved on
 * cards keeps landing on the same layers.
 */
export declare function extractFieldsFromNode(rootNode: Node, previous?: CustomBlockField[]): {
    fields: CustomBlockField[];
    defaultContent: Record<string, unknown>;
    layout: Node;
};
/**
 * Creates a TemplateCustomBlock from a selected Frame/Container node.
 */
export declare function createCustomBlockFromNode(node: Node, label: string, icon?: string, description?: string): TemplateCustomBlock;
/**
 * Re-derive a block from its source layer: picks up every style, structure and
 * default-content change the admin made after "Make Widget", while keeping
 * field keys / labels / editable flags stable.
 */
export declare function syncCustomBlock(block: TemplateCustomBlock, sourceNode: Node): TemplateCustomBlock;
/** Sync every custom block whose source layer still exists in the template. */
export declare function syncCustomBlocks<T extends TemplateDefinition>(def: T): T;
/** The fields an end user may edit in the card editor. */
export declare function editableCustomBlockFields(block: TemplateCustomBlock): CustomBlockField[];
/**
 * The block layout with the card's content written into each child layer.
 * Fields with a `prop` are applied directly; older blocks (no `prop`) keep
 * relying on their `self` bindings. Non-editable fields always render the
 * template's default.
 */
export declare function applyCustomBlockContent(block: TemplateCustomBlock, content: Record<string, unknown> | undefined): Node;
