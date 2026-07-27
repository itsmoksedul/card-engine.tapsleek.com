/**
 * Build artifact — the compiled stylesheet plus everything needed to address
 * it immutably on the CDN.
 *
 * The hash is content-derived, so republishing an unchanged design produces
 * the same object key and every cache in the chain (browser, CDN, Next data
 * cache) keeps its entry.
 */
import type { TemplateDefinition } from '../types/definition';
import { type CompileOptions } from './compile-css';
export interface TemplateArtifact {
    css: string;
    /** First 16 hex chars of sha256(css) — the cache buster. */
    hash: string;
    bytes: number;
    /** `templates/<templateId>/v<version>.<hash>.css` */
    key: string;
    googleFontsHref: string | null;
    warnings: string[];
    emptyNodes: string[];
}
export interface BuildArtifactInput {
    definition: TemplateDefinition;
    templateId: string;
    version: number;
    options?: CompileOptions;
    /** Object-key prefix, default `templates/`. */
    prefix?: string;
}
export declare function sha256Hex(input: string, length?: number): string;
export declare function buildArtifact(input: BuildArtifactInput): TemplateArtifact;
/**
 * Stable fingerprint of the *design inputs*, used to skip a recompile when a
 * draft save didn't actually change anything the stylesheet depends on.
 */
export declare function definitionFingerprint(def: TemplateDefinition): string;
/** JSON.stringify with sorted keys, so key order can't churn the hash. */
export declare function stableStringify(value: unknown): string;
