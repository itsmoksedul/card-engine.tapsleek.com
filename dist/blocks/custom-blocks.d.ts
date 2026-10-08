import type { Node } from "../types/node";
import type { CustomBlockField, TemplateCustomBlock } from "../types/definition";
/**
 * Inspects an ElementNode (e.g. a Frame/Group) and discovers all editable
 * content fields (headings, texts, images, videos, buttons, and inner widgets).
 */
export declare function extractFieldsFromNode(rootNode: Node): {
    fields: CustomBlockField[];
    defaultContent: Record<string, unknown>;
};
/**
 * Creates a TemplateCustomBlock from a selected Frame/Container node.
 */
export declare function createCustomBlockFromNode(node: Node, label: string, icon?: string, description?: string): TemplateCustomBlock;
