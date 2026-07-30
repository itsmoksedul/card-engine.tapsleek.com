/**
 * Definition validation — the gate the old system never had.
 *
 * `CardTemplate.definition` used to be `@IsObject()` and nothing more, so a
 * mis-shaped blueprint silently cloned broken data into real cards. Every
 * write now goes through this: structure, style whitelist, widget schemas,
 * uniqueness and hard caps, with a JSON path on every issue.
 *
 * Errors block the write. Warnings don't — they surface in the builder so an
 * admin can see dead part styles or an unreachable node before publishing.
 */
import { type TemplateDefinition } from "../types/definition";
export interface Issue {
    path: string;
    message: string;
}
export interface DefinitionValidation {
    ok: boolean;
    errors: Issue[];
    warnings: Issue[];
    stats: {
        nodes: number;
        depth: number;
        widgets: number;
        slots: number;
        bytes: number;
    };
}
export interface ValidateOptions {
    /** Hosts an `image` field / background image may point at. */
    imageHosts?: string[];
    /** Skip widget content/design checks (faster draft autosave path). */
    shallow?: boolean;
}
export declare function validateDefinition(input: unknown, options?: ValidateOptions): DefinitionValidation;
/** Throwable wrapper for call sites that want an exception. */
export declare function assertValidDefinition(input: unknown, options?: ValidateOptions): TemplateDefinition;
/** Automatically sanitizes template definition for valid save & publish. */
export declare function sanitizeTemplateDefinition<T = unknown>(input: T): T;
