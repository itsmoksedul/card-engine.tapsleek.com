/**
 * Widget registry — the one file that grows when you add a widget.
 *
 * Everything else derives from here:
 *   • the builder palette            (`manifest()` → GET /admin/widgets)
 *   • content validation             (`schemaToZod(meta.contentSchema)`)
 *   • publish-time template linting
 *   • lazy content migration         (`migrations`)
 *   • the generic widget test suite   (`previews`)
 *
 * A widget type is NEVER removed — a template somewhere still references it.
 * Retire one with `meta.deprecated` instead: hidden from the palette, still
 * renders, flagged as a warning on publish.
 */
import type { AnyWidgetMeta, WidgetMigrations, WidgetPreviews } from "../types/widget";
export interface RegisteredWidget {
    meta: AnyWidgetMeta;
    migrations?: WidgetMigrations;
    previews?: WidgetPreviews;
}
/** Every registered type, in palette order. */
export declare const WIDGET_TYPES: string[];
export declare function getWidget(type: string): RegisteredWidget | undefined;
export declare function getWidgetMeta(type: string): AnyWidgetMeta | undefined;
export declare function hasWidget(type: string): boolean;
/**
 * JSON-safe descriptor list. This is what the builder palette renders and what
 * the backend validates against — one source of truth, so the two cannot drift.
 */
export declare function manifest(): AnyWidgetMeta[];
/** Palette listing: deprecated widgets are hidden from new placements. */
export declare function paletteManifest(): AnyWidgetMeta[];
/** Widget types that need client JS — used to keep static cards JS-free. */
export declare function interactiveTypes(): string[];
/** Widgets whose content is derived from card data rather than stored. */
export declare function derivedTypes(): string[];
/** Every part key a widget declares — used to reject dead `partStyles`. */
export declare function partKeys(type: string): string[];
