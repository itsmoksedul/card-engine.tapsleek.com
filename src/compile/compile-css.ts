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
 * overrides are injected into it at render time
 *
 * Breakpoints are DESKTOP-FIRST. Within `ts-template`, source order is:
 * tokens → `base` (Desktop) → `md` (Tablet, `max-width`) → `sm` (Mobile,
 * `max-width`). Desktop is unconditional; each smaller breakpoint overrides it
 * below its threshold, and because the two override media queries share the same
 * specificity the narrower one (Mobile) must come LAST to win.
 * Interaction states carry an extra pseudo-class, so they outrank every
 * breakpoint rule by specificity and their position is irrelevant.
 *
 * `options.flattenTo` collapses the cascade for a SINGLE breakpoint into plain,
 * media-query-free rules — used by the in-page admin canvas so a Tablet/Mobile
 * override is visible on a wide desktop editor window (where a `max-width` query
 * would never match). It never touches the published artifact.
 */

import {
  BREAKPOINT_MEDIA,
  STATE_KEYS,
  type Breakpoint,
  type StyleProps,
  type StyleSet,
} from "../types/style";
import {
  definitionRoots,
  TOKEN_GROUPS,
  TOKEN_PREFIX,
  type TemplateDefinition,
  type TokenGroup,
} from "../types/definition";
import {
  isElement,
  isSlot,
  isWidget,
  walkTreeOrder,
  type Node,
} from "../types/node";
import type { CardTheme } from "../types/block";
import { resolveBlockDesign, blockClass } from "../blocks/resolve-design";
import { WIDGET_TYPES, getWidgetMeta } from "../widgets/registry";
import { declarationsFor, serializeDecls, type Decl } from "./declarations";
import {
  color,
  cssValue,
  IDENT_RE,
  len,
  safeUrl,
  utf8Bytes,
  VALUE_RE,
} from "./value";

export interface CompileOptions {
  /** Readable output for the builder's debug drawer. Default false. */
  pretty?: boolean;
  /** Wrapper class the whole sheet is scoped to. Default `ts-card`. */
  scope?: string;
  /** Emit `@font-face` for self-hosted fonts. Default true. */
  emitFonts?: boolean;
  /** Base URL for self-hosted font files. */
  fontBaseUrl?: string;
  /**
   * Preview a single breakpoint by flattening the desktop-first cascade into
   * media-query-free rules. `base` = Desktop only; `md` = Desktop + Tablet;
   * `sm` = Desktop + Tablet + Mobile. Admin-canvas only — omit for the real
   * artifact, which always ships the full `max-width` cascade.
   */
  flattenTo?: Breakpoint;
  /**
   * v2.1 — also emit per-widget-TYPE preset classes (`.tsb-<type>`) so a user's
   * composed blocks are styled by this template. `'template'` = only the widget
   * types used in the template; `'all'` = every registered type (so a block of a
   * type the template never used still renders styled). Omit for the pre-2.1
   * template-only stylesheet.
   */
  emitBlockPresets?: "template" | "all";
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

const DEFAULT_SCOPE = "ts-card";

export function compileCss(
  def: TemplateDefinition,
  options: CompileOptions = {},
): CompileResult {
  const pretty = options.pretty ?? false;
  // Tolerate a caller passing a selector-style scope (".ts-card-abc"): the
  // compiler builds `.${scope}`, so a leading dot would produce an unmatchable
  // `..ts-card-abc`. Strip it so both `"ts-card"` and `".ts-card"` work.
  const scope = (options.scope ?? DEFAULT_SCOPE).replace(/^\.+/, "");
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
  const width = Number.isFinite(def.meta?.canvasWidth)
    ? def.meta.canvasWidth
    : 450;
  frameDecls.push(["width", "100%"]);
  frameDecls.push([
    "max-width",
    `${Math.max(280, Math.min(1200, Math.round(width)))}px`,
  ]);
  frameDecls.push(["margin-inline", "auto"]);
  frameDecls.push(["background-color", "transparent"]);

  // ── 3. Node rules ──────────────────────────────────────────────────────
  for (const root of definitionRoots(def)) {
    walkTreeOrder(root, (node) => {
      const cls = nodeClass(node.id, warnings);
      if (!cls) return;
      const sel = `.${scope} .${cls}`;
      let produced = 0;

      // base / sm / md
      for (const bp of ["base", "sm", "md"] as const) {
        const props = { ...mergeHidden(node.style?.[bp], node.hidden?.[bp]) };
        // Ensure root card container clips child elements cleanly when border-radius is set
        if (node.id === "root" && props.borderRadius && props.overflow === undefined) {
          props.overflow = "hidden";
        }
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

      // activeStyle — emitted as `.p-<id>Active` for dynamic active state
      // e.g. the currently-selected carousel dot gets this class at runtime
      if (isElement(node) && (node as any).activeStyle) {
        const activeId = `p-${node.id}Active`;
        produced += pushStyleSet(
          (node as any).activeStyle,
          `.${scope} .${activeId}`,
          bucket,
          states,
        );
      }


      if (isWidget(node)) {
        // Merge defaultPartStyles (from widget meta) with node.partStyles so
        // that widgets using the React render component (no layout tree) still
        // get their base styles compiled into CSS. node.partStyles overrides.
        const defaultParts = getWidgetMeta(node.widget)?.defaultPartStyles ?? {};
        const mergedPartStyles: Record<string, StyleSet> = {};
        const allPartKeys = new Set([
          ...Object.keys(defaultParts),
          ...Object.keys(node.partStyles ?? {}),
        ]);
        for (const key of allPartKeys) {
          mergedPartStyles[key] = {
            ...(defaultParts[key as keyof typeof defaultParts] as StyleSet | undefined),
            ...(node.partStyles?.[key as keyof typeof node.partStyles] as StyleSet | undefined),
          };
        }
        if (Object.keys(mergedPartStyles).length) {
          produced += compilePartStyles(
            mergedPartStyles,
            sel,
            bucket,
            states,
            warnings,
          );
        }

        const layout = node.layout ?? getWidgetMeta(node.widget)?.defaultLayout;
        if (layout) {
          walkTreeOrder(layout, (layoutNode) => {
            const layoutCls = nodeClass(layoutNode.id, warnings);
            if (!layoutCls) return;
            const layoutSel = `${sel} .${layoutCls}`;
            for (const bp of ["base", "sm", "md"] as const) {
              const props = mergeHidden(
                layoutNode.style?.[bp],
                layoutNode.hidden?.[bp],
              );
              const decls = declarationsFor(props);
              if (decls.length) {
                bucket[bp].push({ selector: layoutSel, decls });
                produced += decls.length;
              }
            }
            for (const state of STATE_KEYS) {
              const decls = declarationsFor(layoutNode.style?.[state]);
              if (decls.length) {
                states.push({ selector: `${layoutSel}:${state}`, decls });
                produced += decls.length;
              }
            }
            // activeStyle → emitted as .p-<id>Active
            if ((layoutNode as any).activeStyle) {
              const activeSel = `.${scope} .p-${layoutNode.id}Active`;
              produced += pushStyleSet(
                (layoutNode as any).activeStyle,
                activeSel,
                bucket,
                states,
              );
            }
          });
        }
      }

      // slot presets → same shape, keyed per allowed widget type
      if (isSlot(node) && node.presets) {
        for (const [type, preset] of Object.entries(node.presets)) {
          if (!preset?.partStyles) continue;
          const scoped = `${sel} [data-widget="${cssSafeAttr(type)}"]`;
          produced += compilePartStyles(
            preset.partStyles,
            scoped,
            bucket,
            states,
            warnings,
          );
        }
      }

      if (produced === 0 && (isElement(node) ? node.tag !== "spacer" : true)) {
        emptyNodes.push(node.id);
      }
    });
  }

  // ── 3.5 Block presets (v2.1) ───────────────────────────────────────────
  // Per widget TYPE, so any block a user composes is styled by this template.
  if (options.emitBlockPresets) {
    const types =
      options.emitBlockPresets === "all"
        ? WIDGET_TYPES
        : templateWidgetTypes(def);
    for (const type of types) {
      const { partStyles, layout, rootStyle, rootHidden } = resolveBlockDesign(def, type);
      const sel = `.${scope} .${blockClass(type)}`;
      if (partStyles && Object.keys(partStyles).length) {
        compilePartStyles(partStyles, sel, bucket, states, warnings);
      }
      if (rootStyle || rootHidden) {
        for (const bp of ["base", "sm", "md"] as const) {
          const props = mergeHidden(rootStyle?.[bp], rootHidden?.[bp]);
          const decls = declarationsFor(props);
          if (decls.length) bucket[bp].push({ selector: sel, decls });
        }
        for (const state of STATE_KEYS) {
          const decls = declarationsFor(rootStyle?.[state]);
          if (decls.length)
            states.push({ selector: `${sel}:${state}`, decls });
        }
      }
      if (layout) {
        walkTreeOrder(layout, (layoutNode) => {
          const layoutCls = nodeClass(layoutNode.id, warnings);
          if (!layoutCls) return;
          const layoutSel = `${sel} .${layoutCls}`;
          for (const bp of ["base", "sm", "md"] as const) {
            const props = mergeHidden(
              layoutNode.style?.[bp],
              layoutNode.hidden?.[bp],
            );
            const decls = declarationsFor(props);
            if (decls.length) bucket[bp].push({ selector: layoutSel, decls });
          }
          for (const state of STATE_KEYS) {
            const decls = declarationsFor(layoutNode.style?.[state]);
            if (decls.length)
              states.push({ selector: `${layoutSel}:${state}`, decls });
          }
        });
      }
    }
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
  const nl = pretty ? "\n" : "";
  const out: string[] = [];

  out.push(`@layer ts-reset, ts-template, ts-override;`);
  out.push(`@layer ts-reset{${resetCss(scope, pretty)}}`);

  const fonts = compileFonts(def, options, warnings);
  if (fonts.faces) out.push(fonts.faces);

  const body: string[] = [];
  body.push(rule(`.${scope}`, [...tokenDecls, ...frameDecls], pretty));
  // Desktop base — always unconditional, always first.
  body.push(...dedupe(base).map((r) => rule(r.selector, r.decls, pretty)));

  if (options.flattenTo) {
    // Preview mode: pour the applicable override layers straight into the
    // cascade with no media wrapper, Tablet before Mobile so the narrower wins.
    const active: Exclude<Breakpoint, "base">[] =
      options.flattenTo === "sm"
        ? ["md", "sm"]
        : options.flattenTo === "md"
          ? ["md"]
          : [];
    for (const bp of active) {
      body.push(
        ...dedupe(bucket[bp]).map((r) => rule(r.selector, r.decls, pretty)),
      );
    }
  } else {
    // Desktop-first cascade: Tablet (wider max-width) first, Mobile last.
    const mdCss = dedupe(md)
      .map((r) => rule(r.selector, r.decls, pretty))
      .join(nl);
    if (mdCss) {
      body.push(`@media ${BREAKPOINT_MEDIA.md}{${nl}${mdCss}${nl}}`);
      body.push(`@container ${BREAKPOINT_MEDIA.md}{${nl}${mdCss}${nl}}`);
    }

    const smCss = dedupe(sm)
      .map((r) => rule(r.selector, r.decls, pretty))
      .join(nl);
    if (smCss) {
      body.push(`@media ${BREAKPOINT_MEDIA.sm}{${nl}${smCss}${nl}}`);
      body.push(`@container ${BREAKPOINT_MEDIA.sm}{${nl}${smCss}${nl}}`);
    }
  }

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

const DEFAULT_TOKENS: Record<TokenGroup, Record<string, string>> = {
  color: {
    primary: "#6366f1",
    surface: "#ffffff",
    bg: "#f8fafc",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    onPrimary: "#ffffff",
  },
  space: {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
  },
  radius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "16px",
    full: "9999px",
  },
  font: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  size: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
  },
  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
};

/** Token table → CSS custom properties. Invalid literals are dropped + warned. */
function compileTokens(def: TemplateDefinition, warnings: string[]): Decl[] {
  const decls: Decl[] = [];
  const tokens = def.tokens ?? ({} as TemplateDefinition["tokens"]);

  for (const group of TOKEN_GROUPS) {
    const table = {
      ...DEFAULT_TOKENS[group],
      ...((tokens as Record<TokenGroup, Record<string, string>>)[group] ?? {}),
    };

    for (const [name, raw] of Object.entries(table)) {
      if (!IDENT_RE.test(name)) {
        warnings.push(`token ${group}.${name}: invalid name, dropped`);
        continue;
      }
      const value = validateTokenLiteral(group, raw);
      if (value === null) {
        warnings.push(
          `token ${group}.${name}: invalid value "${String(raw)}", dropped`,
        );
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
  if (typeof raw !== "string" || raw.length > 200) return null;
  const v = raw.trim();
  switch (group) {
    case "color":
      return VALUE_RE.color.test(v) ? v : null;
    case "space":
    case "radius":
    case "size":
      return VALUE_RE.length.test(v) ? v : null;
    case "font":
      return VALUE_RE.fontFamily.test(v) ? v : null;
    case "shadow":
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
  for (const bp of ["base", "sm", "md"] as const) {
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
function mergeHidden(
  props: StyleProps | undefined,
  hidden: boolean | undefined,
): StyleProps | undefined {
  if (!hidden) return props;
  return { ...(props ?? {}), display: "none" };
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
    return { selector: hit.selectors.join(","), decls: hit.decls };
  });
}

function rule(selector: string, decls: Decl[], pretty: boolean): string {
  if (!decls.length) return "";
  return pretty
    ? `${selector} {\n${serializeDecls(decls, true)}\n}`
    : `${selector}{${serializeDecls(decls)}}`;
}

function nodeClass(id: unknown, warnings: string[]): string | null {
  if (typeof id !== "string" || !IDENT_RE.test(id) || id.length > 64) {
    warnings.push(`node id "${String(id)}": invalid, skipped`);
    return null;
  }
  return `n${id}`;
}

function cssSafeAttr(v: string): string {
  return String(v).replace(/[^A-Za-z0-9_-]/g, "");
}

/**
 * Minimal reset. The host apps run Tailwind Preflight, which would otherwise
 * strip margins and list styles the template relies on. Scoped so it can't
 * touch the surrounding page.
 */
function resetCss(scope: string, pretty: boolean): string {
  const nl = pretty ? "\n" : "";
  const rules = [
    `.${scope} *,.${scope} *::before,.${scope} *::after{box-sizing:border-box}`,
    `.${scope}{-webkit-font-smoothing:antialiased;text-size-adjust:100%;color:var(--c-text, #0f172a)}`,
    `.${scope} img,.${scope} video{display:block;max-width:100%;height:auto}`,
    `.${scope} a{color:inherit;text-decoration:none}`,
    `.${scope} button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}`,
    `.${scope} p,.${scope} h1,.${scope} h2,.${scope} h3,.${scope} h4,.${scope} figure,.${scope} blockquote{margin:0}`,
    `.${scope} ul,.${scope} ol{margin:0;padding:0;list-style:none}`,
    `.${scope} svg{stroke-width:inherit}`,
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
    return { faces: "", googleHref: null };
  }

  const faces: string[] = [];
  const googleFamilies: string[] = [];

  for (const font of def.fonts) {
    if (!font?.family || !VALUE_RE.fontFamily.test(font.family)) {
      warnings.push(`font "${String(font?.family)}": invalid family, skipped`);
      continue;
    }
    const weights = (font.weights ?? [400]).filter(
      (w) => Number.isInteger(w) && w >= 100 && w <= 900,
    );
    if (!weights.length) continue;

    if (font.source === "google") {
      googleFamilies.push(
        `family=${encodeURIComponent(font.family)}:wght@${weights.sort((a, b) => a - b).join(";")}`,
      );
      continue;
    }

    const display = font.display ?? "swap";
    for (const weight of weights) {
      const file = font.files?.[String(weight)];
      const url = file ? safeUrl(joinUrl(options.fontBaseUrl, file)) : null;
      if (!url) {
        warnings.push(
          `font ${font.family}@${weight}: no valid self-hosted file, skipped`,
        );
        continue;
      }
      faces.push(
        `@font-face{font-family:"${font.family}";font-style:${font.italic ? "italic" : "normal"};` +
          `font-weight:${weight};font-display:${display};src:url("${url}") format("woff2")}`,
      );
    }
  }

  return {
    faces: faces.join(""),
    googleHref: googleFamilies.length
      ? `https://fonts.googleapis.com/css2?${googleFamilies.join("&")}&display=swap`
      : null,
  };
}

function joinUrl(base: string | undefined, path: string): string {
  if (/^https:\/\//i.test(path)) return path;
  if (!base) return path;
  return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

// ─── Render-time override sheet (tiny, inline, NOT part of the artifact) ─────

/**
 * A Pro user's token overrides, scoped to one card. Emitted inline at render
 * time in the `ts-override` layer, so it wins over the template without the
 * template's artifact ever changing — which is what keeps the CDN object
 * immutable and shared across every card on the template.
 */
export function compileTokenOverrides(
  overrides:
    | Partial<Record<TokenGroup, Record<string, string>>>
    | null
    | undefined,
  cardScopeClass: string,
  allow?: string[],
): string {
  if (!overrides || !IDENT_RE.test(cardScopeClass)) return "";
  const allowSet = allow?.length ? new Set(allow) : null;
  const decls: string[] = [];

  for (const group of TOKEN_GROUPS) {
    const table = overrides[group];
    if (!table || typeof table !== "object") continue;
    for (const [name, raw] of Object.entries(table)) {
      if (!IDENT_RE.test(name)) continue;
      // Only colour overrides are gated by `allowTokenOverride`.
      if (group === "color" && allowSet && !allowSet.has(name)) continue;
      const value = validateTokenLiteral(group, raw);
      if (value === null) continue;
      decls.push(`${TOKEN_PREFIX[group]}${name}:${value}`);
    }
  }

  if (!decls.length) return "";
  return `@layer ts-override{.${cardScopeClass}{${decls.join(";")}}}`;
}

/**
 * v2.1 — a card owner's global Theme → inline override, scoped to the card.
 *
 * Maps the user-facing knobs onto the template's design tokens, so the whole
 * card recolours/retypes/re-spaces without the immutable template artifact
 * changing. Emitted in the `ts-override` layer at render time, exactly like
 * `compileTokenOverrides`. `fontWeight` and `layout` are applied at render (a
 * root class), not here.
 */
export function compileCardTheme(
  theme: CardTheme | null | undefined,
  cardScopeClass: string,
): string {
  if (!theme || !IDENT_RE.test(cardScopeClass)) return "";
  const decls: string[] = [];

  for (const [name, raw] of Object.entries(theme.colors ?? {})) {
    if (!IDENT_RE.test(name)) continue;
    const v = validateTokenLiteral("color", raw);
    if (v !== null) decls.push(`${TOKEN_PREFIX.color}${name}:${v}`);
  }

  if (theme.fontFamily) {
    const v = validateTokenLiteral("font", theme.fontFamily);
    if (v !== null)
      decls.push(
        `${TOKEN_PREFIX.font}heading:${v}`,
        `${TOKEN_PREFIX.font}body:${v}`,
      );
  }

  if (theme.radius != null) {
    const v = validateTokenLiteral("radius", `${theme.radius}px`);
    if (v !== null)
      for (const key of ["sm", "md", "lg"])
        decls.push(`${TOKEN_PREFIX.radius}${key}:${v}`);
  }

  if (theme.density != null) {
    const v = validateTokenLiteral("space", `${theme.density}px`);
    if (v !== null) decls.push(`${TOKEN_PREFIX.space}4:${v}`);
  }

  if (!decls.length) return "";
  return `@layer ts-override{.${cardScopeClass}{${decls.join(";")}}}`;
}

/** Distinct widget types placed in the template tree, in first-seen order. */
function templateWidgetTypes(def: TemplateDefinition): string[] {
  const seen = new Set<string>();
  for (const root of definitionRoots(def)) {
    walkTreeOrder(root, (n) => {
      if (isWidget(n)) seen.add(n.widget);
    });
  }
  return [...seen];
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
