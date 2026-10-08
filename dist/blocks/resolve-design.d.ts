import { type TemplateDefinition } from "../types/definition";
import { type ElementNode } from "../types/node";
import type { StyleSet } from "../types/style";
export interface BlockDesign {
    design: Record<string, unknown>;
    partStyles: Record<string, StyleSet>;
    layout?: ElementNode;
    hasCustomLayout?: boolean;
    rootStyle?: StyleSet;
    rootHidden?: Partial<Record<"base" | "sm" | "md", boolean>>;
}
/**
 * The `(design, partStyles)` a user block of `type` should render with, given
 * the card's template. Deterministic and pure.
 */
export declare function resolveBlockDesign(def: TemplateDefinition, type: string): BlockDesign;
/**
 * Every widget type a user may add as a block. Design/decoration + content
 * widgets are user-addable; identity widgets that read card data (`derived`)
 * and the lead form (edited in its own tab) are not.
 */
export declare function userBlockTypes(allTypes: {
    type: string;
    derived?: boolean;
}[]): string[];
/** The CSS class a block wrapper carries so it picks up the template preset. */
export declare function blockClass(type: string): string;
