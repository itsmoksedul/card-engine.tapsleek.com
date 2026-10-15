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
import { collectSlots, collectWidgets } from '../types/node';
import { definitionRoots } from '../types/definition';
import { getWidget } from '../widgets/registry';
import { migrateWidgetContent, VERSION_KEY } from './migrate';
/** Every widget node in a definition, including popup trees. */
export function widgetNodesOf(def) {
    return definitionRoots(def).flatMap((root) => collectWidgets(root));
}
/** `{ widgetKey: widgetType }` for a definition — used by content migration. */
export function widgetTypeMap(def) {
    const out = {};
    for (const node of widgetNodesOf(def))
        out[node.key] = node.widget;
    for (const root of definitionRoots(def)) {
        for (const slot of collectSlots(root))
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
export function switchTemplateContent(content, fromDef, toDef, options = {}) {
    const notes = [];
    const mapping = {};
    const out = {};
    const source = { ...(content ?? {}) };
    const oldNodes = fromDef ? widgetNodesOf(fromDef) : [];
    const oldByKey = new Map(oldNodes.map((n) => [n.key, n]));
    const targets = widgetNodesOf(toDef).filter((n) => !getWidget(n.widget)?.meta.derived);
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
    const newSlots = new Map(definitionRoots(toDef)
        .flatMap((r) => collectSlots(r))
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
    const keys = Object.keys(value).filter((k) => k !== VERSION_KEY);
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
export function seedContentFromTemplate(def) {
    const out = {};
    for (const node of widgetNodesOf(def)) {
        const entry = getWidget(node.widget);
        if (!entry || entry.meta.derived)
            continue;
        const base = node.defaultContent ?? entry.meta.defaultContent;
        if (!base)
            continue;
        out[node.key] = {
            ...JSON.parse(JSON.stringify(base)),
            [VERSION_KEY]: entry.meta.contentVersion ?? 1,
        };
    }
    for (const root of definitionRoots(def)) {
        for (const slot of collectSlots(root))
            out[slot.key] = { items: [] };
    }
    return out;
}
const CORE_WIDGETS = new Set([
    'PROFILE',
    'CONNECT_BUTTONS',
    'HEADER',
    'NAV',
    'CONTACT_LINKS',
    'CONTACT_BUTTONS',
    'LINK_BUTTONS',
    'CUSTOM_LINKS',
    'LINKS',
    'SOCIAL_ICONS',
    'SOCIAL_LINKS',
    'SOCIAL',
    'COPYRIGHT',
    'VCARD_BUTTON',
    'SHARE_BUTTON',
    'LEAD_FORM',
]);
const EXCLUDED_BLOCKS = new Set([
    'LEAD_FORM',
    'PROFILE',
    'CONNECT_BUTTONS',
    'CONTACT_LINKS',
]);
function formatWidgetTitle(type) {
    const clean = type.replace(/[-_]/g, ' ').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
}
/**
 * Seed candidate blocks from a template definition:
 * Extracts customBlocks and content widgets from definition.root with their
 * default contents, ready to be attached to Card.blocks upon card creation.
 */
export function seedBlocksFromTemplate(def) {
    if (!def)
        return [];
    const candidateBlocks = [];
    const seenTypes = new Set();
    // Only what the template actually PLACES becomes a starter block, in tree
    // order (so the new card reads like the template):
    //  - a custom block whose source layer group is in the tree (or a widget
    //    node of its id). Custom blocks defined on the template but no longer
    //    placed anywhere used to be seeded too — extra blocks on every new card;
    //  - a content widget placed directly in the tree. Widgets INSIDE a custom
    //    block's source (e.g. the Title + Description an "About Me" block is
    //    built from) are its parts, not blocks — seeding them duplicated it;
    //  - nothing from inside a widget's own layout (those are its parts too).
    const customBlocks = (Array.isArray(def.customBlocks) ? def.customBlocks : [])
        .filter((cb) => !cb.hidden);
    const customById = new Map(customBlocks.map((cb) => [cb.id, cb]));
    const customBySource = new Map(customBlocks
        .filter((cb) => cb.sourceNodeId && !cb.libraryId)
        .map((cb) => [cb.sourceNodeId, cb]));
    const pushCustom = (cb) => {
        const typeKey = (cb.id || '').toUpperCase();
        if (!typeKey || seenTypes.has(typeKey))
            return;
        seenTypes.add(typeKey);
        candidateBlocks.push({
            type: cb.id,
            title: cb.label || 'Custom Block',
            content: JSON.parse(JSON.stringify(cb.defaultContent ?? {})),
        });
    };
    const walkWidgets = (node) => {
        if (!node)
            return;
        const source = node.id ? customBySource.get(node.id) : undefined;
        if (source) {
            pushCustom(source);
            return; // its widgets are parts of the custom block
        }
        if (node.kind === 'widget' && node.widget) {
            const placedCustom = customById.get(node.widget);
            if (placedCustom) {
                pushCustom(placedCustom);
                return;
            }
            const wUpper = String(node.widget).toUpperCase();
            if (!CORE_WIDGETS.has(wUpper) &&
                !EXCLUDED_BLOCKS.has(wUpper) &&
                !seenTypes.has(wUpper)) {
                seenTypes.add(wUpper);
                const widgetMeta = getWidget(node.widget);
                const widgetContent = node.defaultContent && Object.keys(node.defaultContent).length > 0
                    ? node.defaultContent
                    : (widgetMeta?.meta.defaultContent ?? {});
                candidateBlocks.push({
                    type: wUpper,
                    title: node.label ||
                        node.title ||
                        node.defaultContent?.title ||
                        node.defaultContent?.label ||
                        widgetMeta?.meta.label ||
                        formatWidgetTitle(node.widget),
                    content: JSON.parse(JSON.stringify(widgetContent ?? {})),
                });
            }
            return; // never descend into a widget's own layout
        }
        if (Array.isArray(node.children)) {
            for (const child of node.children)
                walkWidgets(child);
        }
    };
    if (def.root) {
        walkWidgets(def.root);
    }
    return candidateBlocks.map((cand, idx) => ({
        id: `b_${Math.random().toString(36).substring(2, 10)}`,
        type: cand.type,
        widget: cand.type,
        title: cand.title,
        content: cand.content,
        isVisible: true,
        hidden: false,
        position: idx,
        order: idx,
        config: null,
    }));
}
