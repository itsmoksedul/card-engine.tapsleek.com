"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION_KEY = void 0;
exports.migrateWidgetContent = migrateWidgetContent;
exports.migrateCardContent = migrateCardContent;
exports.stampVersion = stampVersion;
const registry_1 = require("../widgets/registry");
/** Reserved key holding the stored content version. */
exports.VERSION_KEY = '_v';
/**
 * Bring one widget's stored content up to the registry's current version.
 * Never throws: a legacy row that can't be migrated degrades to the widget's
 * defaults rather than breaking the card.
 */
function migrateWidgetContent(widgetType, stored) {
    const notes = [];
    const entry = (0, registry_1.getWidget)(widgetType);
    if (!entry) {
        return { content: stripVersion(stored ?? {}), changed: false, notes: [`unknown widget "${widgetType}"`] };
    }
    const target = entry.meta.contentVersion ?? 1;
    if (stored === undefined || stored === null) {
        return { content: clone(entry.meta.defaultContent), changed: false, notes };
    }
    if (typeof stored !== 'object' || Array.isArray(stored)) {
        notes.push(`content for "${widgetType}" was not an object — reset to defaults`);
        return { content: clone(entry.meta.defaultContent), changed: true, notes };
    }
    const from = Number.isInteger(stored[exports.VERSION_KEY]) ? stored[exports.VERSION_KEY] : 1;
    if (from === target)
        return { content: stripVersion(stored), changed: false, notes };
    if (from > target) {
        // Content written by a newer deploy. Leave it alone — a rollback shouldn't
        // destroy data, and unknown keys are stripped by validation anyway.
        notes.push(`content for "${widgetType}" is v${from} but the registry is v${target} — left untouched`);
        return { content: stripVersion(stored), changed: false, notes };
    }
    let current = stripVersion(stored);
    const migrations = entry.migrations ?? {};
    for (let v = from + 1; v <= target; v++) {
        const step = migrations[v];
        if (!step) {
            notes.push(`no migration to v${v} for "${widgetType}" — content passed through unchanged`);
            continue;
        }
        try {
            const next = step(current);
            current = next && typeof next === 'object' && !Array.isArray(next) ? next : current;
        }
        catch (err) {
            notes.push(`migration v${v} for "${widgetType}" threw (${err?.message ?? 'unknown'}) — kept previous shape`);
        }
    }
    return { content: current, changed: true, notes };
}
/**
 * Migrate an entire `Card.content` column against a template's widget nodes.
 * `widgetTypeByKey` comes from the template tree, so content whose widget was
 * removed from the design is left untouched rather than guessed at.
 */
function migrateCardContent(content, widgetTypeByKey) {
    const out = {};
    const notes = [];
    let changed = false;
    for (const [key, stored] of Object.entries(content ?? {})) {
        const type = widgetTypeByKey[key];
        if (!type) {
            // Orphan: the template no longer has this widget. Keep it verbatim —
            // re-adding the widget with the same key brings the content back.
            out[key] = stored;
            continue;
        }
        const result = migrateWidgetContent(type, stored);
        const version = (0, registry_1.getWidget)(type)?.meta.contentVersion ?? 1;
        out[key] = { ...result.content, [exports.VERSION_KEY]: version };
        if (result.changed)
            changed = true;
        notes.push(...result.notes);
    }
    return { content: out, changed, notes };
}
/** Stamp content with the registry's current version, ready to store. */
function stampVersion(widgetType, content) {
    const version = (0, registry_1.getWidget)(widgetType)?.meta.contentVersion ?? 1;
    return { ...content, [exports.VERSION_KEY]: version };
}
function stripVersion(value) {
    if (!(exports.VERSION_KEY in value))
        return { ...value };
    const out = { ...value };
    delete out[exports.VERSION_KEY];
    return out;
}
function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
}
