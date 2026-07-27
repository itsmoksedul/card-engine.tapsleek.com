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
import { type WidgetNode } from '../types/node';
import { type TemplateDefinition } from '../types/definition';
import { type CardContent } from './migrate';
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
export declare function widgetNodesOf(def: TemplateDefinition): WidgetNode[];
/** `{ widgetKey: widgetType }` for a definition — used by content migration. */
export declare function widgetTypeMap(def: TemplateDefinition): Record<string, string>;
/**
 * Map a card's content from one template onto another.
 *
 * Derived widgets (PROFILE, CONTACT_LINKS) are skipped: they hold no stored
 * content, so there is nothing to carry.
 */
export declare function switchTemplateContent(content: CardContent | null | undefined, fromDef: TemplateDefinition | null | undefined, toDef: TemplateDefinition, options?: SwitchOptions): SwitchResult;
/**
 * Seed a brand-new card from a template: every editable widget starts on the
 * template's demo content, so the card opens looking populated.
 */
export declare function seedContentFromTemplate(def: TemplateDefinition): CardContent;
