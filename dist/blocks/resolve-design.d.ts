/**
 * resolveBlockDesign — how a user block gets its look (v2.1).
 *
 * A user block stores only content. Its design comes from the card's TEMPLATE:
 *
 *   1. If the template contains a widget of the same type, use that instance's
 *      `design` + `partStyles` — "the template's design pattern for this widget."
 *   2. Otherwise fall back to the widget meta's `defaultDesign` +
 *      `defaultPartStyles`, so a block of a type the template never used still
 *      renders styled rather than raw.
 *
 * Framework-free: shared by the compiler (emits the preset CSS) and the renderer
 * (applies the preset design), so the two can never disagree.
 */
import { type TemplateDefinition } from '../types/definition';
import type { StyleSet } from '../types/style';
export interface BlockDesign {
    design: Record<string, unknown>;
    partStyles: Record<string, StyleSet>;
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
