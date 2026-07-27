/**
 * Lazy content migration.
 *
 * Card content is stored per widget key with the widget's `contentVersion`:
 *
 *   content: { "reviews_main": { "_v": 1, "title": "…", "items": [...] } }
 *
 * When a widget's shape changes, you bump `contentVersion` and add a migration
 * — you do NOT rewrite a million rows. Migrations run on read, and the result
 * is persisted on the card's next write. Old rows keep working forever.
 *
 * Rules the registry relies on:
 *   • forward-only, pure, and total — a migration must never throw
 *   • never delete a migration
 *   • bump only on breaking changes; adding an optional field needs no bump
 */
/** Reserved key holding the stored content version. */
export declare const VERSION_KEY = "_v";
export interface StoredWidgetContent extends Record<string, unknown> {
    _v?: number;
}
/** The whole `Card.content` column. */
export type CardContent = Record<string, StoredWidgetContent>;
export interface MigrationOutcome {
    content: Record<string, unknown>;
    /** True when the stored shape differed and should be written back. */
    changed: boolean;
    /** Non-fatal notes (a migration threw, an unknown widget, …). */
    notes: string[];
}
/**
 * Bring one widget's stored content up to the registry's current version.
 * Never throws: a legacy row that can't be migrated degrades to the widget's
 * defaults rather than breaking the card.
 */
export declare function migrateWidgetContent(widgetType: string, stored: StoredWidgetContent | undefined | null): MigrationOutcome;
/**
 * Migrate an entire `Card.content` column against a template's widget nodes.
 * `widgetTypeByKey` comes from the template tree, so content whose widget was
 * removed from the design is left untouched rather than guessed at.
 */
export declare function migrateCardContent(content: CardContent | null | undefined, widgetTypeByKey: Record<string, string>): {
    content: CardContent;
    changed: boolean;
    notes: string[];
};
/** Stamp content with the registry's current version, ready to store. */
export declare function stampVersion(widgetType: string, content: Record<string, unknown>): StoredWidgetContent;
