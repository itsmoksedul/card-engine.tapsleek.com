"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.widgetNodesOf = widgetNodesOf;
exports.widgetTypeMap = widgetTypeMap;
exports.switchTemplateContent = switchTemplateContent;
exports.seedContentFromTemplate = seedContentFromTemplate;
const node_1 = require("../types/node");
const definition_1 = require("../types/definition");
const registry_1 = require("../widgets/registry");
const migrate_1 = require("./migrate");
/** Every widget node in a definition, including popup trees. */
function widgetNodesOf(def) {
    return (0, definition_1.definitionRoots)(def).flatMap((root) => (0, node_1.collectWidgets)(root));
}
/** `{ widgetKey: widgetType }` for a definition — used by content migration. */
function widgetTypeMap(def) {
    const out = {};
    for (const node of widgetNodesOf(def))
        out[node.key] = node.widget;
    for (const root of (0, definition_1.definitionRoots)(def)) {
        for (const slot of (0, node_1.collectSlots)(root))
            out[slot.key] = '__slot__';
    }
    return out;
}
/**
 * Map a card's content from one template onto another.
 *
 * Derived widgets (PROFILE, CONTACT_LINKS) are skipped: they hold no stored
 * content, so there is nothing to carry.
 */
function switchTemplateContent(content, fromDef, toDef, options = {}) {
    const notes = [];
    const mapping = {};
    const out = {};
    const source = { ...(content ?? {}) };
    const oldNodes = fromDef ? widgetNodesOf(fromDef) : [];
    const oldByKey = new Map(oldNodes.map((n) => [n.key, n]));
    const targets = widgetNodesOf(toDef).filter((n) => !(0, registry_1.getWidget)(n.widget)?.meta.derived);
    const pool = [];
    for (const [key, value] of Object.entries(source)) {
        const node = oldByKey.get(key);
        pool.push({
            key,
            widget: node?.widget ?? '',
            role: node?.role,
            value: value,
        });
    }
    const taken = new Set();
    const claim = (predicate) => {
        const hit = pool.find((c) => !taken.has(c.key) && predicate(c));
        if (hit)
            taken.add(hit.key);
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
                    [migrate_1.VERSION_KEY]: (0, registry_1.getWidget)(target.widget)?.meta.contentVersion ?? 1,
                };
            }
            continue;
        }
        const migrated = (0, migrate_1.migrateWidgetContent)(target.widget, match.value);
        notes.push(...migrated.notes);
        out[target.key] = {
            ...migrated.content,
            [migrate_1.VERSION_KEY]: (0, registry_1.getWidget)(target.widget)?.meta.contentVersion ?? 1,
        };
        mapping[match.key] = target.key;
        if (match.key !== target.key) {
            notes.push(`carried "${match.key}" → "${target.key}" (${target.widget})`);
        }
    }
    // Slots keep their content only when the new template has a slot of the same
    // key that still allows those widget types.
    const newSlots = new Map((0, definition_1.definitionRoots)(toDef)
        .flatMap((r) => (0, node_1.collectSlots)(r))
        .map((s) => [s.key, s]));
    for (const [key, slot] of newSlots) {
        const stored = source[key];
        if (!stored || taken.has(key))
            continue;
        taken.add(key);
        const items = Array.isArray(stored.items)
            ? (stored.items ?? [])
            : [];
        const kept = items.filter((i) => i?.widget && slot.allow.includes(i.widget));
        if (kept.length !== items.length) {
            notes.push(`slot "${key}": dropped ${items.length - kept.length} widget(s) the new template doesn't allow`);
        }
        out[key] = { items: kept.slice(0, slot.max ?? 20) };
    }
    // Everything unclaimed is archived, never deleted.
    const archive = [...(options.existingArchive ?? [])];
    const now = new Date().toISOString();
    for (const c of pool) {
        if (taken.has(c.key))
            continue;
        if (!c.value || typeof c.value !== 'object')
            continue;
        if (isEmptyContent(c.value))
            continue;
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
function isEmptyContent(value) {
    const keys = Object.keys(value).filter((k) => k !== migrate_1.VERSION_KEY);
    if (!keys.length)
        return true;
    return keys.every((k) => {
        const v = value[k];
        if (v === null || v === undefined || v === '')
            return true;
        if (Array.isArray(v))
            return v.length === 0;
        return false;
    });
}
/**
 * Seed a brand-new card from a template: every editable widget starts on the
 * template's demo content, so the card opens looking populated.
 */
function seedContentFromTemplate(def) {
    const out = {};
    for (const node of widgetNodesOf(def)) {
        const entry = (0, registry_1.getWidget)(node.widget);
        if (!entry || entry.meta.derived)
            continue;
        const base = node.defaultContent ?? entry.meta.defaultContent;
        if (!base)
            continue;
        out[node.key] = {
            ...JSON.parse(JSON.stringify(base)),
            [migrate_1.VERSION_KEY]: entry.meta.contentVersion ?? 1,
        };
    }
    for (const root of (0, definition_1.definitionRoots)(def)) {
        for (const slot of (0, node_1.collectSlots)(root))
            out[slot.key] = { items: [] };
    }
    return out;
}
