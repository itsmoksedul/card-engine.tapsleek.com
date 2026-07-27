/**
 * compileCss — TemplateDefinition → one immutable stylesheet.
 *
 * Runs once, on publish. The output is uploaded to R2 under a content hash and
 * served with `immutable` caching, so no request ever touches this code and no
 * CSS text is ever stored in the database.
 *
 * Cascade contract (relied on by the builder and the renderer):
 *   1. `@layer ts-reset`     — neutralise the host app's Preflight inside .ts-card
 *   2. `@layer ts-template`  — tokens, base rules, breakpoints, states
 *   3. `@layer ts-override`  — left empty here; the card's inline token
 *                              overrides are injected into it at render time
 *
 * Within `ts-template`, source order is: tokens → base → `sm` → `md`.
 * Interaction states carry an extra pseudo-class, so they outrank every
 * breakpoint rule by specificity and their position is irrelevant.
 */

import {
  BREAKPOINTS,
  STATE_KEYS,
  type StyleProps,
  type StyleSet,
} from '../types/style';
import {
  definitionRoots,
  TOKEN_GROUPS,
  TOKEN_PREFIX,
  type TemplateDefinition,
  type TokenGroup,
} from '../types/definition';
import { isElement, isSlot, isWidget, walkTreeOrder, type Node } from '../types/node';
import { declarationsFor, serializeDecls, type Decl } from './declarations';
import { color, cssValue, IDENT_RE, len, safeUrl, utf8Bytes, VALUE_RE } from './value';

export interface CompileOptions {
  /** Readable output for the builder's debug drawer. Default false. */
  pretty?: boolean;
  /** Wrapper class the whole sheet is scoped to. Default `ts-card`. */
  scope?: string;
  /** Emit `@font-face` for self-hosted fonts. Default true. */
  emitFonts?: boolean;
  /** Base URL for self-hosted font files. */
  fontBaseUrl?: string;
}

export interface CompileResult {
  css: string;
  /** Google Fonts stylesheet href, when the template uses `source: 'google'`. */
  googleFontsHref: string | null;
  /** Node ids that produced no declarations at all — surfaced as lint hints. */
  emptyNodes: string[];
  /** Non-fatal problems (dropped values, unknown tokens). */
  warnings: string[];
  bytes: number;
}

interface Rule {
  selector: string;
  decls: Decl[];
}

const DEFAULT_SCOPE = 'ts-card';

export function compileCss(
  def: TemplateDefinition,
  options: CompileOptions = {},
): CompileResult {
  const pretty = options.pretty ?? false;
  const scope = options.scope ?? DEFAULT_SCOPE;
  const warnings: string[] = [];
  const emptyNodes: string[] = [];

  const base: Rule[] = [];
  const sm: Rule[] = [];
  const md: Rule[] = [];
  const states: Rule[] = [];

  const bucket = { base, sm, md };

  // ── 1. Tokens ──────────────────────────────────────────────────────────
  const tokenDecls = compileTokens(def, warnings);

  // ── 2. Card frame ──────────────────────────────────────────────────────
  const frameDecls: Decl[] = [];
  const width = Number.isFinite(def.meta?.canvasWidth) ? def.meta.canvasWidth : 450;
  frameDecls.push(['width', '100%']);
  frameDecls.push(['max-width', `${Math.max(280, Math.min(1200, Math.round(width)))}px`]);
  frameDecls.push(['margin-inline', 'auto']);
  if (def.meta?.background) {
    const bg = color(def.meta.background);
    if (bg) frameDecls.push(['background-color', bg]);
  }

  // ── 3. Node rules ──────────────────────────────────────────────────────
  for (const root of definitionRoots(def)) {
    walkTreeOrder(root, (node) => {
      const cls = nodeClass(node.id, warnings);
      if (!cls) return;
      const sel = `.${scope} .${cls}`;
      let produced = 0;

      // base / sm / md
      for (const bp of ['base', 'sm', 'md'] as const) {
        const props = mergeHidden(node.style?.[bp], node.hidden?.[bp]);
        const decls = declarationsFor(props);
        if (decls.length) {
          bucket[bp].push({ selector: sel, decls });
          produced += decls.length;
        }
      }

      // interaction states
      for (const state of STATE_KEYS) {
        const decls = declarationsFor(node.style?.[state]);
        if (decls.length) {
          states.push({ selector: `${sel}:${state}`, decls });
          produced += decls.length;
        }
      }

      // widget parts → `.ts-card .n<id> .p-<part>`
      if (isWidget(node) && node.partStyles) {
        produced += compilePartStyles(node.partStyles, sel, bucket, states, warnings);
      }

      // slot presets → same shape, keyed per allowed widget type
      if (isSlot(node) && node.presets) {
        for (const [type, preset] of Object.entries(node.presets)) {
          if (!preset?.partStyles) continue;
          const scoped = `${sel} [data-widget="${cssSafeAttr(type)}"]`;
          produced += compilePartStyles(preset.partStyles, scoped, bucket, states, warnings);
        }
      }

      if (produced === 0 && (isElement(node) ? node.tag !== 'spacer' : true)) {
        emptyNodes.push(node.id);
      }
    });
  }

  // ── 4. Popup chrome ────────────────────────────────────────────────────
  for (const popup of def.popups ?? []) {
    const key = cssSafeAttr(popup.key);
    const backdropSel = `.${scope} [data-popup-backdrop="${key}"]`;
    const panelSel = `.${scope} [data-popup-panel="${key}"]`;
    pushStyleSet(popup.backdrop, backdropSel, bucket, states);
    pushStyleSet(popup.panel, panelSel, bucket, states);
  }

  // ── 5. Assemble ────────────────────────────────────────────────────────
  const nl = pretty ? '\n' : '';
  const out: string[] = [];

  out.push(`@layer ts-reset, ts-template, ts-override;`);
  out.push(`@layer ts-reset{${resetCss(scope, pretty)}}`);

  const fonts = compileFonts(def, options, warnings);
  if (fonts.faces) out.push(fonts.faces);

  const body: string[] = [];
  body.push(rule(`.${scope}`, [...tokenDecls, ...frameDecls], pretty));
  body.push(...dedupe(base).map((r) => rule(r.selector, r.decls, pretty)));

  const smCss = dedupe(sm).map((r) => rule(r.selector, r.decls, pretty)).join(nl);
  if (smCss) body.push(`@media (min-width:${BREAKPOINTS.sm}px){${nl}${smCss}${nl}}`);

  const mdCss = dedupe(md).map((r) => rule(r.selector, r.decls, pretty)).join(nl);
  if (mdCss) body.push(`@media (min-width:${BREAKPOINTS.md}px){${nl}${mdCss}${nl}}`);

  body.push(...dedupe(states).map((r) => rule(r.selector, r.decls, pretty)));

  out.push(`@layer ts-template{${nl}${body.filter(Boolean).join(nl)}${nl}}`);

  const css = out.filter(Boolean).join(nl);

  return {
    css,
    googleFontsHref: fonts.googleHref,
    emptyNodes,
    warnings,
    bytes: utf8Bytes(css),
  };
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

/** Token table → CSS custom properties. Invalid literals are dropped + warned. */
function compileTokens(def: TemplateDefinition, warnings: string[]): Decl[] {
  const decls: Decl[] = [];
  const tokens = def.tokens ?? ({} as TemplateDefinition['tokens']);

  for (const group of TOKEN_GROUPS) {
    const table = (tokens as Record<TokenGroup, Record<string, string>>)[group];
    if (!table || typeof table !== 'object') continue;

    for (const [name, raw] of Object.entries(table)) {
      if (!IDENT_RE.test(name)) {
        warnings.push(`token ${group}.${name}: invalid name, dropped`);
        continue;
      }
      const value = validateTokenLiteral(group, raw);
      if (value === null) {
        warnings.push(`token ${group}.${name}: invalid value "${String(raw)}", dropped`);
        continue;
      }
      decls.push([`${TOKEN_PREFIX[group]}${name}`, value]);
    }
  }
  return decls;
}

/**
 * Token literals are validated ONCE, here. Every use site is then just
 * `var(--x)`, which is why a token ref never needs per-property validation.
 */
function validateTokenLiteral(group: TokenGroup, raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 200) return null;
  const v = raw.trim();
  switch (group) {
    case 'color':
      return VALUE_RE.color.test(v) ? v : null;
    case 'space':
    case 'radius':
    case 'size':
      return VALUE_RE.length.test(v) ? v : null;
    case 'font':
      return VALUE_RE.fontFamily.test(v) ? v : null;
    case 'shadow':
      // Shadow tokens are literal box-shadow values — tightly constrained.
      return /^[a-z0-9\s.,()#%/-]+$/i.test(v) && !/[;{}@\\]/.test(v) ? v : null;
    default:
      return null;
  }
}

function compilePartStyles(
  partStyles: Record<string, StyleSet>,
  parentSel: string,
  bucket: { base: Rule[]; sm: Rule[]; md: Rule[] },
  states: Rule[],
  warnings: string[],
): number {
  let produced = 0;
  for (const [part, set] of Object.entries(partStyles)) {
    if (!IDENT_RE.test(part)) {
      warnings.push(`part "${part}": invalid name, dropped`);
      continue;
    }
    produced += pushStyleSet(set, `${parentSel} .p-${part}`, bucket, states);
  }
  return produced;
}

function pushStyleSet(
  set: StyleSet | undefined,
  selector: string,
  bucket: { base: Rule[]; sm: Rule[]; md: Rule[] },
  states: Rule[],
): number {
  if (!set) return 0;
  let produced = 0;
  for (const bp of ['base', 'sm', 'md'] as const) {
    const decls = declarationsFor(set[bp]);
    if (decls.length) {
      bucket[bp].push({ selector, decls });
      produced += decls.length;
    }
  }
  for (const state of STATE_KEYS) {
    const decls = declarationsFor(set[state]);
    if (decls.length) {
      states.push({ selector: `${selector}:${state}`, decls });
      produced += decls.length;
    }
  }
  return produced;
}

/** `hidden[bp] === true` folds into that breakpoint as `display:none`. */
function mergeHidden(props: StyleProps | undefined, hidden: boolean | undefined): StyleProps | undefined {
  if (!hidden) return props;
  return { ...(props ?? {}), display: 'none' };
}

/**
 * Merge rules whose declaration bodies are byte-identical into one selector
 * list. Renderer-transparent (no class map needed) and typically trims 15–30%
 * off a template that reuses spacing patterns.
 */
function dedupe(rules: Rule[]): Rule[] {
  const byBody = new Map<string, { selectors: string[]; decls: Decl[] }>();
  const order: string[] = [];
  for (const r of rules) {
    if (!r.decls.length) continue;
    const body = serializeDecls(r.decls);
    let hit = byBody.get(body);
    if (!hit) {
      hit = { selectors: [], decls: r.decls };
      byBody.set(body, hit);
      order.push(body);
    }
    if (!hit.selectors.includes(r.selector)) hit.selectors.push(r.selector);
  }
  return order.map((body) => {
    const hit = byBody.get(body)!;
    return { selector: hit.selectors.join(','), decls: hit.decls };
  });
}

function rule(selector: string, decls: Decl[], pretty: boolean): string {
  if (!decls.length) return '';
  return pretty
    ? `${selector} {\n${serializeDecls(decls, true)}\n}`
    : `${selector}{${serializeDecls(decls)}}`;
}

function nodeClass(id: unknown, warnings: string[]): string | null {
  if (typeof id !== 'string' || !IDENT_RE.test(id) || id.length > 64) {
    warnings.push(`node id "${String(id)}": invalid, skipped`);
    return null;
  }
  return `n${id}`;
}

function cssSafeAttr(v: string): string {
  return String(v).replace(/[^A-Za-z0-9_-]/g, '');
}

/**
 * Minimal reset. The host apps run Tailwind Preflight, which would otherwise
 * strip margins and list styles the template relies on. Scoped so it can't
 * touch the surrounding page.
 */
function resetCss(scope: string, pretty: boolean): string {
  const nl = pretty ? '\n' : '';
  const rules = [
    `.${scope} *,.${scope} *::before,.${scope} *::after{box-sizing:border-box}`,
    `.${scope}{-webkit-font-smoothing:antialiased;text-size-adjust:100%}`,
    `.${scope} img,.${scope} video{display:block;max-width:100%;height:auto}`,
    `.${scope} a{color:inherit;text-decoration:none}`,
    `.${scope} button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}`,
    `.${scope} p,.${scope} h1,.${scope} h2,.${scope} h3,.${scope} h4,.${scope} figure,.${scope} blockquote{margin:0}`,
    `.${scope} ul,.${scope} ol{margin:0;padding:0;list-style:none}`,
  ];
  return rules.join(nl);
}

interface FontOutput {
  faces: string;
  googleHref: string | null;
}

function compileFonts(
  def: TemplateDefinition,
  options: CompileOptions,
  warnings: string[],
): FontOutput {
  if (options.emitFonts === false || !def.fonts?.length) {
    return { faces: '', googleHref: null };
  }

  const faces: string[] = [];
  const googleFamilies: string[] = [];

  for (const font of def.fonts) {
    if (!font?.family || !VALUE_RE.fontFamily.test(font.family)) {
      warnings.push(`font "${String(font?.family)}": invalid family, skipped`);
      continue;
    }
    const weights = (font.weights ?? [400]).filter((w) => Number.isInteger(w) && w >= 100 && w <= 900);
    if (!weights.length) continue;

    if (font.source === 'google') {
      googleFamilies.push(`family=${encodeURIComponent(font.family)}:wght@${weights.sort((a, b) => a - b).join(';')}`);
      continue;
    }

    const display = font.display ?? 'swap';
    for (const weight of weights) {
      const file = font.files?.[String(weight)];
      const url = file
        ? safeUrl(joinUrl(options.fontBaseUrl, file))
        : null;
      if (!url) {
        warnings.push(`font ${font.family}@${weight}: no valid self-hosted file, skipped`);
        continue;
      }
      faces.push(
        `@font-face{font-family:"${font.family}";font-style:${font.italic ? 'italic' : 'normal'};` +
          `font-weight:${weight};font-display:${display};src:url("${url}") format("woff2")}`,
      );
    }
  }

  return {
    faces: faces.join(''),
    googleHref: googleFamilies.length
      ? `https://fonts.googleapis.com/css2?${googleFamilies.join('&')}&display=swap`
      : null,
  };
}

function joinUrl(base: string | undefined, path: string): string {
  if (/^https:\/\//i.test(path)) return path;
  if (!base) return path;
  return `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

// ─── Render-time override sheet (tiny, inline, NOT part of the artifact) ─────

/**
 * A Pro user's token overrides, scoped to one card. Emitted inline at render
 * time in the `ts-override` layer, so it wins over the template without the
 * template's artifact ever changing — which is what keeps the CDN object
 * immutable and shared across every card on the template.
 */
export function compileTokenOverrides(
  overrides: Partial<Record<TokenGroup, Record<string, string>>> | null | undefined,
  cardScopeClass: string,
  allow?: string[],
): string {
  if (!overrides || !IDENT_RE.test(cardScopeClass)) return '';
  const allowSet = allow?.length ? new Set(allow) : null;
  const decls: string[] = [];

  for (const group of TOKEN_GROUPS) {
    const table = overrides[group];
    if (!table || typeof table !== 'object') continue;
    for (const [name, raw] of Object.entries(table)) {
      if (!IDENT_RE.test(name)) continue;
      // Only colour overrides are gated by `allowTokenOverride`.
      if (group === 'color' && allowSet && !allowSet.has(name)) continue;
      const value = validateTokenLiteral(group, raw);
      if (value === null) continue;
      decls.push(`${TOKEN_PREFIX[group]}${name}:${value}`);
    }
  }

  if (!decls.length) return '';
  return `@layer ts-override{.${cardScopeClass}{${decls.join(';')}}}`;
}

/** Nodes referenced by the tree, for lint + dead-CSS detection. */
export function collectNodeIds(def: TemplateDefinition): string[] {
  const ids: string[] = [];
  for (const root of definitionRoots(def)) {
    walkTreeOrder(root, (n: Node) => ids.push(n.id));
  }
  return ids;
}

export { cssValue, len };
