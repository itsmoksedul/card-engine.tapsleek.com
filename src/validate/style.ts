/**
 * Style validation.
 *
 * The trick here: the COMPILER is the validator. A style value is valid iff
 * `declarationsFor({ [key]: value })` produces at least one declaration. That
 * makes it structurally impossible for the validator and the compiler to
 * disagree — there is exactly one table of truth (`EMITTERS`), and a value the
 * compiler would silently drop is rejected at write time instead.
 */

import { ALLOWED_STYLE_PROPS, declarationsFor } from '../compile/declarations';
import { BREAKPOINT_KEYS, STATE_KEYS, type StyleProps, type StyleSet } from '../types/style';

export interface StyleIssue {
  path: string;
  message: string;
}

const ALLOWED = new Set<string>(ALLOWED_STYLE_PROPS as string[]);
const STYLE_SET_KEYS = new Set<string>([...BREAKPOINT_KEYS, ...STATE_KEYS]);

/** Max properties in one StyleProps object — a sanity cap, not a design limit. */
const MAX_PROPS_PER_LAYER = 60;

export function validateStyleProps(
  props: unknown,
  path: string,
  issues: StyleIssue[],
): void {
  if (props === undefined || props === null) return;
  if (typeof props !== 'object' || Array.isArray(props)) {
    issues.push({ path, message: 'must be an object' });
    return;
  }

  const entries = Object.entries(props as Record<string, unknown>);
  if (entries.length > MAX_PROPS_PER_LAYER) {
    issues.push({ path, message: `too many properties (${entries.length} > ${MAX_PROPS_PER_LAYER})` });
    return;
  }

  for (const [key, value] of entries) {
    if (!ALLOWED.has(key)) {
      issues.push({ path: `${path}.${key}`, message: `unknown style property "${key}"` });
      continue;
    }
    if (value === undefined || value === null || value === '') continue;

    const decls = declarationsFor({ [key]: value } as StyleProps);
    if (!decls.length) {
      issues.push({
        path: `${path}.${key}`,
        message: `invalid value for "${key}" — would be dropped at compile time`,
      });
    }
  }
}

export function validateStyleSet(set: unknown, path: string, issues: StyleIssue[]): void {
  if (set === undefined || set === null) return;
  if (typeof set !== 'object' || Array.isArray(set)) {
    issues.push({ path, message: 'must be an object' });
    return;
  }

  for (const [key, layer] of Object.entries(set as Record<string, unknown>)) {
    if (!STYLE_SET_KEYS.has(key)) {
      issues.push({
        path: `${path}.${key}`,
        message: `unknown style layer "${key}" (expected base | sm | md | hover | active | focus)`,
      });
      continue;
    }
    validateStyleProps(layer, `${path}.${key}`, issues);
  }
}

/**
 * Strip everything the compiler would drop, so what lands in the DB is exactly
 * what renders. Used on draft autosave, where we want tolerance rather than
 * rejection.
 */
export function sanitizeStyleSet(set: StyleSet | undefined): StyleSet | undefined {
  if (!set || typeof set !== 'object') return undefined;
  const out: StyleSet = {};
  let kept = 0;

  for (const key of [...BREAKPOINT_KEYS, ...STATE_KEYS] as (keyof StyleSet)[]) {
    const layer = set[key];
    if (!layer || typeof layer !== 'object') continue;
    const clean: Record<string, unknown> = {};
    for (const [prop, value] of Object.entries(layer)) {
      if (!ALLOWED.has(prop)) continue;
      if (value === undefined || value === null || value === '') continue;
      if (!declarationsFor({ [prop]: value } as StyleProps).length) continue;
      clean[prop] = value;
      kept++;
    }
    if (Object.keys(clean).length) out[key] = clean as StyleProps;
  }

  return kept ? out : undefined;
}
