/**
 * Value layer — turns authored style values into CSS text.
 *
 * The compiler is a GENERATOR, not a pass-through: every value that reaches
 * CSS is either produced by one of these serializers or dropped. There is no
 * code path that copies an arbitrary author string into a declaration, which
 * is why `expression()`, `url(javascript:…)` and `@import` can never appear.
 */

import { TOKEN_PREFIX, type TokenGroup } from "../types/definition";
import type {
  BackgroundValue,
  BorderValue,
  Box4,
  Corners4,
  ShadowValue,
  StyleValue,
  TransformValue,
  TransitionValue,
} from "../types/style";

/** `{group.name}` optionally followed by `/alpha` (e.g. `{color.primary}/15%`). */
const TOKEN_RE =
  /^\{(color|space|radius|font|size|shadow)\.([A-Za-z0-9_-]+)\}(?:\/(\d+(?:\.\d+)?%?))?$/;

/** Safe CSS identifier — token names and node ids are held to this. */
export const IDENT_RE = /^[A-Za-z0-9_-]+$/;

export const VALUE_RE = {
  /** Lengths, percentages and the keywords we allow in their place. */
  length:
    /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|fr)$|^0$|^auto$|^fit-content$|^min-content$|^max-content$/,
  color:
    /^#[0-9A-Fa-f]{3,8}$|^rgba?\(\s*[\d.]+\s*[, ]\s*[\d.]+\s*[, ]\s*[\d.]+\s*([,/]\s*[\d.]+%?\s*)?\)$|^hsla?\(\s*[\d.]+(deg)?\s*[, ]\s*[\d.]+%\s*[, ]\s*[\d.]+%\s*([,/]\s*[\d.]+%?\s*)?\)$|^transparent$|^currentColor$/,
  /** Unitless numbers, used for line-height / opacity / z-index. */
  number: /^-?\d+(\.\d+)?$/,
  /** Font stacks: quoted or bare families separated by commas. */
  fontFamily: /^[A-Za-z0-9 _'"-]+(\s*,\s*[A-Za-z0-9 _'"-]+)*$/,
  aspectRatio: /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$|^auto$/,
  /** Grid track lists — digits, fr/px/%, minmax, repeat, auto keywords. */
  gridTemplate: /^[\d\s./%a-z(),-]+$/i,
  /** Free-form but heavily restricted: alignment keywords only. */
  keyword: /^[a-z-]+( [a-z-]+)*$/,
  /** Percentages and keywords for background/object position. */
  position: /^[\d\s.%a-z-]+$/i,
  /** Cubic-bezier / steps / named easings. */
  easing:
    /^(linear|ease|ease-in|ease-out|ease-in-out)$|^cubic-bezier\(\s*[\d.\s,-]+\)$|^steps\(\s*\d+\s*(,\s*[a-z-]+\s*)?\)$/,
  /** blend modes, cursor, etc. */
  simpleKeyword: /^[a-z][a-z-]*$/,
} as const;

export type ValueKind = keyof typeof VALUE_RE;

export function isTokenRef(v: unknown): v is string {
  return typeof v === "string" && TOKEN_RE.test(v);
}

export function parseTokenRef(
  v: string,
): { group: TokenGroup; name: string; alpha?: string } | null {
  const m = TOKEN_RE.exec(v);
  return m ? { group: m[1] as TokenGroup, name: m[2], alpha: m[3] } : null;
}

/** `{color.primary}` → `var(--c-primary)`. With alpha → `color-mix(in srgb, var(--c-primary) 15%, transparent)`. */
export function tokenVar(
  group: TokenGroup,
  name: string,
  alpha?: string,
): string {
  const v = `var(${TOKEN_PREFIX[group]}${name})`;
  if (alpha) {
    let p = alpha;
    if (!p.endsWith("%")) {
      const num = parseFloat(p);
      p = num <= 1 ? `${Math.round(num * 100)}%` : `${num}%`;
    }
    return `color-mix(in srgb, ${v} ${p}, transparent)`;
  }
  return v;
}

/**
 * Resolve one scalar value to CSS text, or `null` if it fails validation.
 * A token ref always wins — its literal value is validated once, at the token
 * table, not at every use site.
 */
export function cssValue(
  v: StyleValue | undefined,
  kind: ValueKind,
): string | null {
  if (v === undefined || v === null || v === "") return null;

  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    // Bare numbers are lengths in px, except where unitless is meaningful.
    if (kind === "number") return String(v);
    if (kind === "length") return v === 0 ? "0" : `${v}px`;
    return String(v);
  }

  const s = v.trim();
  if (s.length > 200) return null;

  const ref = parseTokenRef(s);
  if (ref) return tokenVar(ref.group, ref.name, ref.alpha);

  if (kind === "length" && /^-?\d+(\.\d+)?$/.test(s)) {
    return s === "0" ? "0" : `${s}px`;
  }

  return VALUE_RE[kind].test(s) ? s : null;
}

/** A length that may also be a raw number (interpreted as px). */
export function len(v: StyleValue | undefined): string | null {
  return cssValue(v, "length");
}

export function color(v: StyleValue | undefined): string | null {
  return cssValue(v, "color");
}

// ─── Composite serializers ───────────────────────────────────────────────────

/**
 * Box4 → `padding` / `margin`. Emits the 4-value shorthand so a later
 * breakpoint that changes one side still produces a complete, predictable box.
 */
export function box4(b: Box4 | string | number | undefined): string | null {
  if (b === undefined || b === null || b === "") return null;
  const obj = typeof b !== "object" ? { all: b } : b;
  if (Object.keys(obj).length === 0) return null;
  const all = obj.all !== undefined ? len(obj.all) : null;
  const side = (v: StyleValue | undefined) =>
    v !== undefined ? (len(v) ?? all ?? "0") : (all ?? "0");
  const t = side(obj.t);
  const r = side(obj.r);
  const bo = side(obj.b);
  const l = side(obj.l);
  if (t === r && r === bo && bo === l) return t;
  if (t === bo && r === l) return `${t} ${r}`;
  return `${t} ${r} ${bo} ${l}`;
}

/** Corners4 → `border-radius`. */
export function corners4(
  c: Corners4 | string | number | undefined,
): string | null {
  if (c === undefined || c === null || c === "") return null;
  const obj = typeof c !== "object" ? { all: c } : c;
  if (Object.keys(obj).length === 0) return null;
  const all = obj.all !== undefined ? len(obj.all) : null;
  const corner = (v: StyleValue | undefined) =>
    v !== undefined ? (len(v) ?? all ?? "0") : (all ?? "0");
  const tl = corner(obj.tl);
  const tr = corner(obj.tr);
  const br = corner(obj.br);
  const bl = corner(obj.bl);
  if (tl === tr && tr === br && br === bl) return tl;
  return `${tl} ${tr} ${br} ${bl}`;
}

const BORDER_STYLES = new Set(["solid", "dashed", "dotted", "none"]);

/** BorderValue → one or more declarations. */
export function border(b: BorderValue | undefined): [string, string][] {
  if (!b || typeof b !== "object") return [];
  const out: [string, string][] = [];
  const w = b.width !== undefined ? len(b.width) : null;
  const st =
    b.style && BORDER_STYLES.has(b.style) ? b.style : w ? "solid" : null;
  const c = b.color !== undefined ? color(b.color) : null;

  if (b.sides && typeof b.sides === "object") {
    for (const [k, side] of Object.entries(b.sides)) {
      const name = { t: "top", r: "right", b: "bottom", l: "left" }[k];
      if (!name || !side) continue;
      const sw = side.width !== undefined ? len(side.width) : w;
      const ss = side.style && BORDER_STYLES.has(side.style) ? side.style : st;
      const sc = side.color !== undefined ? color(side.color) : c;
      if (sw && ss)
        out.push([`border-${name}`, `${sw} ${ss} ${sc ?? "currentColor"}`]);
    }
    return out;
  }

  if (w && st) out.push(["border", `${w} ${st} ${c ?? "currentColor"}`]);
  else if (st) out.push(["border-style", st]);
  else if (c) out.push(["border-color", c]);
  return out;
}

const BG_SIZES = new Set(["cover", "contain", "auto"]);
const BG_REPEATS = new Set(["no-repeat", "repeat", "repeat-x", "repeat-y"]);

/** BackgroundValue → declarations. Image URLs must already be allowlisted. */
export function background(
  bg: BackgroundValue | string | undefined,
): [string, string][] {
  if (typeof bg === "string") {
    const c = color(bg);
    return c ? [["background-color", c]] : [];
  }
  if (!bg || typeof bg !== "object") return [];

  if (bg.kind === "color") {
    const c = color(bg.color);
    return c ? [["background-color", c]] : [];
  }

  if (bg.kind === "gradient") {
    const stops = (bg.stops ?? [])
      .map((s) => {
        const c = color(s.color);
        if (!c) return null;
        const at = s.at !== undefined ? cssValue(s.at, "length") : null;
        return at ? `${c} ${at}` : c;
      })
      .filter((x): x is string => x !== null);
    if (stops.length < 2) return [];
    const angle = Number.isFinite(bg.angle)
      ? Math.round(bg.angle as number)
      : 180;
    return [
      ["background-image", `linear-gradient(${angle}deg, ${stops.join(", ")})`],
    ];
  }

  if (bg.kind === "image") {
    const url = safeUrl(bg.url);
    if (!url) return [];
    const out: [string, string][] = [["background-image", `url("${url}")`]];
    if (bg.color) {
      const c = color(bg.color);
      if (c) out.unshift(["background-color", c]);
    }
    if (bg.size && BG_SIZES.has(bg.size))
      out.push(["background-size", bg.size]);
    if (bg.repeat && BG_REPEATS.has(bg.repeat))
      out.push(["background-repeat", bg.repeat]);
    else out.push(["background-repeat", "no-repeat"]);
    if (bg.position && VALUE_RE.position.test(bg.position))
      out.push(["background-position", bg.position]);
    return out;
  }

  return [];
}

/** Only https/protocol-relative, and no quote or paren injection. */
export function safeUrl(u: unknown): string | null {
  if (typeof u !== "string") return null;
  const s = u.trim();
  if (s.length > 2000) return null;
  if (/["\'()\\]|[\u0000-\u001f]/.test(s)) return null;
  if (!/^https:\/\/[^\s]+$/i.test(s)) return null;
  return s;
}

/** ShadowValue(s) → one `box-shadow` value. A token ref passes straight through. */
export function shadow(
  sh: ShadowValue | ShadowValue[] | string | undefined,
): string | null {
  if (sh === undefined) return null;
  if (typeof sh === "string") {
    const ref = parseTokenRef(sh);
    return ref ? tokenVar(ref.group, ref.name) : null;
  }
  const list = Array.isArray(sh) ? sh : [sh];
  const parts = list
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const x = len(s.x) ?? "0";
      const y = len(s.y) ?? "0";
      const blur = len(s.blur) ?? "0";
      const spread = s.spread !== undefined ? len(s.spread) : null;
      const c = color(s.color);
      if (!c) return null;
      return `${s.inset ? "inset " : ""}${x} ${y} ${blur}${spread ? ` ${spread}` : ""} ${c}`;
    })
    .filter((x): x is string => x !== null);
  return parts.length ? parts.join(", ") : null;
}

const TRANSITIONABLE = new Set([
  "opacity",
  "transform",
  "background-color",
  "color",
  "border-color",
  "box-shadow",
  "filter",
  "all",
]);

export function transition(t: TransitionValue | undefined): string | null {
  if (!t || typeof t !== "object") return null;
  const props = (Array.isArray(t.property) ? t.property : [])
    .map((p) => String(p).trim())
    .filter((p) => TRANSITIONABLE.has(p));
  if (!props.length) return null;
  const dur = Number.isFinite(t.duration)
    ? Math.max(0, Math.min(5000, t.duration))
    : 150;
  const easing = t.easing && VALUE_RE.easing.test(t.easing) ? t.easing : "ease";
  const delay = Number.isFinite(t.delay)
    ? Math.max(0, Math.min(5000, t.delay as number))
    : 0;
  const suffix = `${dur}ms ${easing}${delay ? ` ${delay}ms` : ""}`;
  return props.map((p) => `${p} ${suffix}`).join(", ");
}

export function transform(t: TransformValue | undefined): string | null {
  if (!t || typeof t !== "object") return null;
  const parts: string[] = [];
  const tx = t.translateX !== undefined ? len(t.translateX) : null;
  const ty = t.translateY !== undefined ? len(t.translateY) : null;
  if (tx || ty) parts.push(`translate(${tx ?? "0"}, ${ty ?? "0"})`);
  if (Number.isFinite(t.scale))
    parts.push(`scale(${clamp(t.scale as number, 0, 10)})`);
  if (Number.isFinite(t.rotate))
    parts.push(`rotate(${clamp(t.rotate as number, -360, 360)}deg)`);
  return parts.length ? parts.join(" ") : null;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * UTF-8 byte length without `Buffer`. The compiler runs in the builder's
 * browser too (for live preview), so nothing in this layer may touch a Node
 * global — that's what keeps `compile/` portable when it moves to the shared
 * package.
 */
const TEXT_ENCODER =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

export function utf8Bytes(input: string): number {
  if (TEXT_ENCODER) return TEXT_ENCODER.encode(input).length;
  // Fallback for exotic runtimes: count code units, good enough for a cap check.
  let bytes = 0;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i++;
    } else bytes += 3;
  }
  return bytes;
}
