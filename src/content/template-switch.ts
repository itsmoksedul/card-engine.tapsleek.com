/**
 * Non-destructive template switching.
 *
 * The old `applyTemplateToExistingCard()` ran `cardBlock.deleteMany` +
 * `cardLink.deleteMany` and reseeded — every custom edit gone, no undo. Here
 * design and content are separate, so switching a template is a re-MAPPING
 * problem, not a delete problem:
 *
 *   1. match by `role`   — "services" → "services", highest fidelity
 *   2. match by widget type, in tree order — same kind of thing, same slot
 *   3. anything left over goes to `contentArchive`, never to /dev/null
 *
 * Nothing is destroyed at any point, so "switch template" is safe to offer as
 * a one-click action.
 */

import { collectSlots, collectWidgets, type WidgetNode } from '../types/node';
import { definitionRoots, type TemplateDefinition } from '../types/definition';
import { getWidget } from '../widgets/registry';
import { migrateWidgetContent, VERSION_KEY, type CardContent } from './migrate';

export interface ArchivedContent {
  key: string;
  widget: string;
  role?: string;
  archivedAt: string;
  /** Template the content was authored against. */
  fromTemplateId?: string;
  content: Record<string, unknown>;
}

export interface SwitchResult {
  content: CardContent;
  archive: ArchivedContent[];
  /** key → key mapping actually applied, for the response/audit log. */
  mapping: Record<string, string>;
  notes: string[];
}

export interface SwitchOptions {
  fromTemplateId?: string;
  /** Existing archive to append to. Capped to keep the JSON column sane. */
  existingArchive?: ArchivedContent[];
  maxArchive?: number;
}

/** Every widget node in a definition, including popup trees. */
export function widgetNodesOf(def: TemplateDefinition): WidgetNode[] {
  return definitionRoots(def).flatMap((root) => collectWidgets(root));
}

/** `{ widgetKey: widgetType }` for a definition — used by content migration. */
export function widgetTypeMap(def: TemplateDefinition): Record<string, string> {
  const out: Record<string, string> = {};
  for (const node of widgetNodesOf(def)) out[node.key] = node.widget;
  for (const root of definitionRoots(def)) {
    for (const slot of collectSlots(root)) out[slot.key] = '__slot__';
  }
  return out;
}

/**
 * Map a card's content from one template onto another.
 *
 * Derived widgets (PROFILE, CONTACT_LINKS) are skipped: they hold no stored
 * content, so there is nothing to carry.
 */
export function switchTemplateContent(
  content: CardContent | null | undefined,
  fromDef: TemplateDefinition | null | undefined,
  toDef: TemplateDefinition,
  options: SwitchOptions = {},
): SwitchResult {
  const notes: string[] = [];
  const mapping: Record<string, string> = {};
  const out: CardContent = {};

  const source = { ...(content ?? {}) };
  const oldNodes = fromDef ? widgetNodesOf(fromDef) : [];
  const oldByKey = new Map(oldNodes.map((n) => [n.key, n]));

  const targets = widgetNodesOf(toDef).filter((n) => !getWidget(n.widget)?.meta.derived);

  // Candidate pool: stored content that belongs to a real old widget, plus any
  // content whose widget we can't identify (still worth trying by key match).
  interface Candidate {
    key: string;
    widget: string;
    role?: string;
    value: Record<string, unknown>;
  }
  const pool: Candidate[] = [];
  for (const [key, value] of Object.entries(source)) {
    const node = oldByKey.get(key);
    pool.push({
      key,
      widget: node?.widget ?? '',
      role: node?.role,
      value: value as Record<string, unknown>,
    });
  }

  const taken = new Set<string>();

  const claim = (predicate: (c: Candidate) => boolean): Candidate | undefined => {
    const hit = pool.find((c) => !taken.has(c.key) && predicate(c));
    if (hit) taken.add(hit.key);
    return hit;
  };

  for (const target of targets) {
    // 1. exact key — the same template, or two templates that agreed on keys
    let match = claim((c) => c.key === target.key && (!c.widget || c.widget === target.widget));

    // 2. same role AND same widget type — the intended semantic match
    if (!match && target.role) {
      match = claim((c) => !!c.role && c.role === target.role && c.widget === target.widget);
    }

    // 3. same role, any type — content shape may still survive migration
    if (!match && target.role) {
      match = claim((c) => !!c.role && c.role === target.role);
    }

    // 4. same widget type, first unclaimed, in tree order
    if (!match) {
      match = claim((c) => c.widget === target.widget);
    }

    if (!match) {
      // Nothing to carry — fall back to the new template's demo content.
      if (target.defaultContent) {
        out[target.key] = {
          ...target.defaultContent,
          [VERSION_KEY]: getWidget(target.widget)?.meta.contentVersion ?? 1,
        };
      }
      continue;
    }

    const migrated = migrateWidgetContent(target.widget, match.value);
    notes.push(...migrated.notes);
    out[target.key] = {
      ...migrated.content,
      [VERSION_KEY]: getWidget(target.widget)?.meta.contentVersion ?? 1,
    };
    mapping[match.key] = target.key;
    if (match.key !== target.key) {
      notes.push(`carried "${match.key}" → "${target.key}" (${target.widget})`);
    }
  }

  // Slots keep their content only when the new template has a slot of the same
  // key that still allows those widget types.
  const newSlots = new Map(
    definitionRoots(toDef)
      .flatMap((r) => collectSlots(r))
      .map((s) => [s.key, s]),
  );
  for (const [key, slot] of newSlots) {
    const stored = source[key];
    if (!stored || taken.has(key)) continue;
    taken.add(key);
    const items = Array.isArray((stored as { items?: unknown }).items)
      ? ((stored as { items: { widget?: string }[] }).items ?? [])
      : [];
    const kept = items.filter((i) => i?.widget && slot.allow.includes(i.widget));
    if (kept.length !== items.length) {
      notes.push(
        `slot "${key}": dropped ${items.length - kept.length} widget(s) the new template doesn't allow`,
      );
    }
    out[key] = { items: kept.slice(0, slot.max ?? 20) } as Record<string, unknown>;
  }

  // Everything unclaimed is archived, never deleted.
  const archive: ArchivedContent[] = [...(options.existingArchive ?? [])];
  const now = new Date().toISOString();
  for (const c of pool) {
    if (taken.has(c.key)) continue;
    if (!c.value || typeof c.value !== 'object') continue;
    if (isEmptyContent(c.value)) continue;
    archive.push({
      key: c.key,
      widget: c.widget || 'UNKNOWN',
      role: c.role,
      archivedAt: now,
      fromTemplateId: options.fromTemplateId,
      content: c.value,
    });
    notes.push(`archived "${c.key}" — no matching widget in the new template`);
  }

  const max = options.maxArchive ?? 60;
  const trimmed = archive.slice(-max);

  return { content: out, archive: trimmed, mapping, notes };
}

/** Content with nothing but a version stamp isn't worth archiving. */
function isEmptyContent(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value).filter((k) => k !== VERSION_KEY);
  if (!keys.length) return true;
  return keys.every((k) => {
    const v = value[k];
    if (v === null || v === undefined || v === '') return true;
    if (Array.isArray(v)) return v.length === 0;
    return false;
  });
}

/**
 * Seed a brand-new card from a template: every editable widget starts on the
 * template's demo content, so the card opens looking populated.
 */
export function seedContentFromTemplate(def: TemplateDefinition): CardContent {
  const out: CardContent = {};
  for (const node of widgetNodesOf(def)) {
    const entry = getWidget(node.widget);
    if (!entry || entry.meta.derived) continue;
    const base = node.defaultContent ?? entry.meta.defaultContent;
    if (!base) continue;
    out[node.key] = {
      ...(JSON.parse(JSON.stringify(base)) as Record<string, unknown>),
      [VERSION_KEY]: entry.meta.contentVersion ?? 1,
    };
  }
  for (const root of definitionRoots(def)) {
    for (const slot of collectSlots(root)) out[slot.key] = { items: [] };
  }
  return out;
}
