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
 * overrides are injected into it at render time
 *
 * Breakpoints are DESKTOP-FIRST. Within `ts-template`, source order is:
 * tokens → `base` (Desktop) → `md` (Tablet, `max-width`) → `sm` (Mobile,
 * `max-width`). Desktop is unconditional; each smaller breakpoint overrides it
 * below its threshold, and because the two override media queries share the same
 * specificity the narrower one (Mobile) must come LAST to win.
 * Interaction states carry an extra pseudo-class, so they outrank every
 * breakpoint rule by specificity and their position is irrelevant.
 *
 * `options.flattenTo` collapses the cascade for a SINGLE breakpoint into plain,
 * media-query-free rules — used by the in-page admin canvas so a Tablet/Mobile
 * override is visible on a wide desktop editor window (where a `max-width` query
 * would never match). It never touches the published artifact.
 */
import { type Breakpoint } from "../types/style";
import { type TemplateDefinition, type TokenGroup } from "../types/definition";
import type { CardTheme } from "../types/block";
import { cssValue, len } from "./value";
export interface CompileOptions {
    /** Readable output for the builder's debug drawer. Default false. */
    pretty?: boolean;
    /** Wrapper class the whole sheet is scoped to. Default `ts-card`. */
    scope?: string;
    /** Emit `@font-face` for self-hosted fonts. Default true. */
    emitFonts?: boolean;
    /** Base URL for self-hosted font files. */
    fontBaseUrl?: string;
    /**
     * Preview a single breakpoint by flattening the desktop-first cascade into
     * media-query-free rules. `base` = Desktop only; `md` = Desktop + Tablet;
     * `sm` = Desktop + Tablet + Mobile. Admin-canvas only — omit for the real
     * artifact, which always ships the full `max-width` cascade.
     */
    flattenTo?: Breakpoint;
    /**
     * v2.1 — also emit per-widget-TYPE preset classes (`.tsb-<type>`) so a user's
     * composed blocks are styled by this template. `'template'` = only the widget
     * types used in the template; `'all'` = every registered type (so a block of a
     * type the template never used still renders styled). Omit for the pre-2.1
     * template-only stylesheet.
     */
    emitBlockPresets?: "template" | "all";
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
/**
 * v2.1 — a card owner's global Theme → inline override, scoped to the card.
 *
 * Maps the user-facing knobs onto the template's design tokens, so the whole
 * card recolours/retypes/re-spaces without the immutable template artifact
 * changing. Emitted in the `ts-override` layer at render time, exactly like
 * `compileTokenOverrides`. `fontWeight` and `layout` are applied at render (a
 * root class), not here.
 */
export declare function compileCardTheme(theme: CardTheme | null | undefined, cardScopeClass: string): string;
/** Nodes referenced by the tree, for lint + dead-CSS detection. */
export declare function collectNodeIds(def: TemplateDefinition): string[];
export { cssValue, len };
