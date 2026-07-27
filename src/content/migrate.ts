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

import { getWidget } from '../widgets/registry';

/** Reserved key holding the stored content version. */
export const VERSION_KEY = '_v';

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
export function migrateWidgetContent(
  widgetType: string,
  stored: StoredWidgetContent | undefined | null,
): MigrationOutcome {
  const notes: string[] = [];
  const entry = getWidget(widgetType);

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

  const from = Number.isInteger(stored[VERSION_KEY]) ? (stored[VERSION_KEY] as number) : 1;

  if (from === target) return { content: stripVersion(stored), changed: false, notes };

  if (from > target) {
    // Content written by a newer deploy. Leave it alone — a rollback shouldn't
    // destroy data, and unknown keys are stripped by validation anyway.
    notes.push(
      `content for "${widgetType}" is v${from} but the registry is v${target} — left untouched`,
    );
    return { content: stripVersion(stored), changed: false, notes };
  }

  let current: Record<string, unknown> = stripVersion(stored);
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
    } catch (err) {
      notes.push(
        `migration v${v} for "${widgetType}" threw (${(err as Error)?.message ?? 'unknown'}) — kept previous shape`,
      );
    }
  }

  return { content: current, changed: true, notes };
}

/**
 * Migrate an entire `Card.content` column against a template's widget nodes.
 * `widgetTypeByKey` comes from the template tree, so content whose widget was
 * removed from the design is left untouched rather than guessed at.
 */
export function migrateCardContent(
  content: CardContent | null | undefined,
  widgetTypeByKey: Record<string, string>,
): { content: CardContent; changed: boolean; notes: string[] } {
  const out: CardContent = {};
  const notes: string[] = [];
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
    const version = getWidget(type)?.meta.contentVersion ?? 1;
    out[key] = { ...result.content, [VERSION_KEY]: version };
    if (result.changed) changed = true;
    notes.push(...result.notes);
  }

  return { content: out, changed, notes };
}

/** Stamp content with the registry's current version, ready to store. */
export function stampVersion(widgetType: string, content: Record<string, unknown>): StoredWidgetContent {
  const version = getWidget(widgetType)?.meta.contentVersion ?? 1;
  return { ...content, [VERSION_KEY]: version };
}

function stripVersion(value: Record<string, unknown>): Record<string, unknown> {
  if (!(VERSION_KEY in value)) return { ...value };
  const out = { ...value };
  delete out[VERSION_KEY];
  return out;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}
