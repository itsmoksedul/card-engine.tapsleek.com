/**
 * Build artifact — the compiled stylesheet plus everything needed to address
 * it immutably on the CDN.
 *
 * The hash is content-derived, so republishing an unchanged design produces
 * the same object key and every cache in the chain (browser, CDN, Next data
 * cache) keeps its entry.
 */

import { createHash } from 'node:crypto';
import type { TemplateDefinition } from '../types/definition';
import { compileCss, type CompileOptions, type CompileResult } from './compile-css';

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

export function sha256Hex(input: string, length = 16): string {
  return createHash('sha256').update(input, 'utf8').digest('hex').slice(0, length);
}

export function buildArtifact(input: BuildArtifactInput): TemplateArtifact {
  const { definition, templateId, version } = input;
  const prefix = (input.prefix ?? 'templates/').replace(/^\/+|\/+$/g, '');

  const result: CompileResult = compileCss(definition, input.options);
  const hash = sha256Hex(result.css);
  const safeId = String(templateId).replace(/[^A-Za-z0-9_-]/g, '');

  return {
    css: result.css,
    hash,
    bytes: result.bytes,
    key: `${prefix}/${safeId}/v${version}.${hash}.css`,
    googleFontsHref: result.googleFontsHref,
    warnings: result.warnings,
    emptyNodes: result.emptyNodes,
  };
}

/**
 * Stable fingerprint of the *design inputs*, used to skip a recompile when a
 * draft save didn't actually change anything the stylesheet depends on.
 */
export function definitionFingerprint(def: TemplateDefinition): string {
  return sha256Hex(stableStringify(def), 32);
}

/** JSON.stringify with sorted keys, so key order can't churn the hash. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`,
  );
  return `{${parts.join(',')}}`;
}
