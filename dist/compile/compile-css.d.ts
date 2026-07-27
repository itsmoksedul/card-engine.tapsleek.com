/**
 * compileCss — TemplateDefinition → one immutable stylesheet.
 *
 * Runs once, on publish. The output is uploaded to R2 under a content hash and
 * served with `immutable` caching, so no request ever touches this code and no
 * CSS text is ever stored in the database.
 *
 * Cascade contract (relied on by the builder and the renderer):
 *   1. `@layer ts-reset`     — neutralise the host app's Preflight inside .ts-card
 *   2. `@layer ts-template`  — tokens, base rules, breakpoints, states
 *   3. `@layer ts-override`  — left empty here; the card's inline token
 *                              overrides are injected into it at render time
 *
 * Within `ts-template`, source order is: tokens → base → `sm` → `md`.
 * Interaction states carry an extra pseudo-class, so they outrank every
 * breakpoint rule by specificity and their position is irrelevant.
 */
import { type TemplateDefinition, type TokenGroup } from '../types/definition';
import { cssValue, len } from './value';
export interface CompileOptions {
    /** Readable output for the builder's debug drawer. Default false. */
    pretty?: boolean;
    /** Wrapper class the whole sheet is scoped to. Default `ts-card`. */
    scope?: string;
    /** Emit `@font-face` for self-hosted fonts. Default true. */
    emitFonts?: boolean;
    /** Base URL for self-hosted font files. */
    fontBaseUrl?: string;
}
export interface CompileResult {
    css: string;
    /** Google Fonts stylesheet href, when the template uses `source: 'google'`. */
    googleFontsHref: string | null;
    /** Node ids that produced no declarations at all — surfaced as lint hints. */
    emptyNodes: string[];
    /** Non-fatal problems (dropped values, unknown tokens). */
    warnings: string[];
    bytes: number;
}
export declare function compileCss(def: TemplateDefinition, options?: CompileOptions): CompileResult;
/**
 * A Pro user's token overrides, scoped to one card. Emitted inline at render
 * time in the `ts-override` layer, so it wins over the template without the
 * template's artifact ever changing — which is what keeps the CDN object
 * immutable and shared across every card on the template.
 */
export declare function compileTokenOverrides(overrides: Partial<Record<TokenGroup, Record<string, string>>> | null | undefined, cardScopeClass: string, allow?: string[]): string;
/** Nodes referenced by the tree, for lint + dead-CSS detection. */
export declare function collectNodeIds(def: TemplateDefinition): string[];
export { cssValue, len };
