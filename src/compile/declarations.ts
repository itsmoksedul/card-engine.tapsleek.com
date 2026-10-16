/**
 * StyleProps → CSS declarations.
 *
 * Driven by an explicit table: a property that isn't in `EMITTERS` produces
 * nothing, no matter what is stored in the JSON. Adding a property to the
 * engine means adding a row here AND to the `StyleProps` interface AND to the
 * validator — three deliberate edits, never an accident.
 */

import type { StylePropKey, StyleProps } from "../types/style";
import {
  background,
  border,
  box4,
  clamp,
  color,
  corners4,
  cssValue,
  len,
  shadow,
  transform,
  transition,
  VALUE_RE,
} from "./value";

export type Decl = [property: string, value: string];

type Emitter = (value: any) => Decl[];

/** `value → [[prop, css]]` for one simple property. */
function simple(prop: string, kind: keyof typeof VALUE_RE): Emitter {
  return (v) => {
    const out = cssValue(v, kind);
    return out ? [[prop, out]] : [];
  };
}

/** Keyword property restricted to an explicit set. */
function enumProp(prop: string, allowed: readonly string[]): Emitter {
  const set = new Set(allowed.map(s => s.toLowerCase()));
  return (v) => (typeof v === "string" && set.has(v.toLowerCase()) ? [[prop, v.toLowerCase()]] : []);
}

/** Integer property with bounds. */
function int(prop: string, min: number, max: number): Emitter {
  return (v) =>
    Number.isFinite(v)
      ? [[prop, String(Math.round(clamp(v as number, min, max)))]]
      : [];
}

const ALIGN = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
  "stretch",
  "baseline",
  "start",
  "end",
  "normal",
  "auto",
] as const;

export const EMITTERS: Partial<Record<StylePropKey, Emitter>> = {
  // ── layout ───────────────────────────────────────────────────────────────
  display: enumProp("display", [
    "flex",
    "grid",
    "block",
    "inline-flex",
    "inline-block",
    "none",
    "contents",
  ]),
  flexDirection: enumProp("flex-direction", [
    "row",
    "column",
    "row-reverse",
    "column-reverse",
  ]),
  flexWrap: enumProp("flex-wrap", ["nowrap", "wrap", "wrap-reverse"]),
  justifyContent: enumProp("justify-content", ALIGN),
  alignItems: enumProp("align-items", ALIGN),
  alignSelf: enumProp("align-self", ALIGN),
  gap: simple("gap", "length"),
  rowGap: simple("row-gap", "length"),
  columnGap: simple("column-gap", "length"),
  flex: simple("flex", "gridTemplate"),
  flexGrow: int("flex-grow", 0, 100),
  flexShrink: int("flex-shrink", 0, 100),
  flexBasis: simple("flex-basis", "length"),
  gridTemplateColumns: simple("grid-template-columns", "gridTemplate"),
  gridTemplateRows: simple("grid-template-rows", "gridTemplate"),
  gridColumn: simple("grid-column", "gridTemplate"),
  gridRow: simple("grid-row", "gridTemplate"),
  gridAutoFlow: enumProp("grid-auto-flow", [
    "row",
    "column",
    "dense",
    "row dense",
    "column dense",
  ]),
  order: int("order", -50, 50),

  // ── positioning ──────────────────────────────────────────────────────────
  position: enumProp("position", [
    "static",
    "relative",
    "absolute",
    "sticky",
    "fixed",
  ]),
  top: simple("top", "length"),
  right: simple("right", "length"),
  bottom: simple("bottom", "length"),
  left: simple("left", "length"),
  zIndex: int("z-index", -50, 9999),
  overflow: (v) => {
    if (v === "hidden") {
      return [
        ["overflow", "hidden"],
        ["isolation", "isolate"],
      ];
    }
    const fn = enumProp("overflow", [
      "visible",
      "hidden",
      "auto",
      "scroll",
      "clip",
    ]);
    return fn(v);
  },
  overflowX: enumProp("overflow-x", [
    "visible",
    "hidden",
    "auto",
    "scroll",
    "clip",
  ]),
  overflowY: enumProp("overflow-y", [
    "visible",
    "hidden",
    "auto",
    "scroll",
    "clip",
  ]),
  isolation: enumProp("isolation", ["auto", "isolate"]),
  scrollSnapType: simple("scroll-snap-type", "keyword"),
  scrollSnapAlign: simple("scroll-snap-align", "keyword"),
  scrollbarWidth: simple("scrollbar-width", "keyword"),
  msOverflowStyle: simple("-ms-overflow-style", "keyword"),

  // ── box model ────────────────────────────────────────────────────────────
  width: simple("width", "length"),
  minWidth: simple("min-width", "length"),
  maxWidth: simple("max-width", "length"),
  height: simple("height", "length"),
  minHeight: simple("min-height", "length"),
  maxHeight: simple("max-height", "length"),
  aspectRatio: simple("aspect-ratio", "aspectRatio"),
  padding: (v) => {
    const out = box4(v);
    return out ? [["padding", out]] : [];
  },
  margin: (v) => {
    const out = box4(v);
    return out ? [["margin", out]] : [];
  },

  // ── typography ───────────────────────────────────────────────────────────
  fontFamily: simple("font-family", "fontFamily"),
  fontSize: simple("font-size", "length"),
  fontWeight: int("font-weight", 100, 900),
  fontStyle: enumProp("font-style", ["normal", "italic"]),
  lineHeight: (v) => {
    // Unitless line-height is the good default; lengths still allowed.
    if (typeof v === "number")
      return [["line-height", String(clamp(v, 0, 10))]];
    const out = cssValue(v, "length");
    return out ? [["line-height", out]] : [];
  },
  letterSpacing: simple("letter-spacing", "length"),
  textAlign: enumProp("text-align", ["left", "center", "right", "justify"]),
  textTransform: enumProp("text-transform", [
    "none",
    "uppercase",
    "lowercase",
    "capitalize",
  ]),
  textDecoration: enumProp("text-decoration", [
    "none",
    "underline",
    "line-through",
  ]),
  whiteSpace: enumProp("white-space", [
    "normal",
    "nowrap",
    "pre-line",
    "pre-wrap",
  ]),
  wordBreak: enumProp("word-break", ["normal", "break-word", "break-all"]),
  lineClamp: (v) =>
    Number.isFinite(v) && (v as number) > 0
      ? [
          ["display", "-webkit-box"],
          ["-webkit-line-clamp", String(Math.round(clamp(v as number, 1, 20)))],
          ["-webkit-box-orient", "vertical"],
          ["overflow", "hidden"],
        ]
      : [],
  color: (v) => {
    const c = color(v);
    return c ? [["color", c]] : [];
  },
  // Emitted together with any background in `declarationsFor` (they share
  // the background-image property), so nothing is emitted here.
  textGradient: () => [],
  strokeWidth: (v) => {
    const out = cssValue(v, "length");
    return out ? [["stroke-width", out]] : [];
  },

  // ── decoration ───────────────────────────────────────────────────────────
  background: (v) => background(v),
  border: (v) => border(v),
  borderRadius: (v) => {
    const out = corners4(v);
    return out ? [["border-radius", out]] : [];
  },
  boxShadow: (v) => {
    const out = shadow(v);
    return out ? [["box-shadow", out]] : [];
  },
  opacity: (v) =>
    Number.isFinite(v) ? [["opacity", String(clamp(v as number, 0, 1))]] : [],
  backdropBlur: (v) => {
    const out = len(v);
    return out ? [["backdrop-filter", `blur(${out})`]] : [];
  },
  filter: (v) =>
    typeof v === "string" && /^[a-z0-9()%.,\s-]+$/i.test(v) && v.length < 120
      ? [["filter", v]]
      : [],
  mixBlendMode: enumProp("mix-blend-mode", [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "soft-light",
    "hard-light",
    "difference",
    "luminosity",
  ]),
  clipPath: (v) =>
    typeof v === "string" &&
    /^(polygon|circle|ellipse|inset)\([\d\s%.,a-z-]+\)$/i.test(v)
      ? [["clip-path", v]]
      : [],

  // ── media ────────────────────────────────────────────────────────────────
  objectFit: enumProp("object-fit", [
    "cover",
    "contain",
    "fill",
    "none",
    "scale-down",
  ]),
  objectPosition: simple("object-position", "position"),

  // ── motion ───────────────────────────────────────────────────────────────
  transition: (v) => {
    const out = transition(v);
    return out ? [["transition", out]] : [];
  },
  transform: (v) => {
    const out = transform(v);
    return out ? [["transform", out]] : [];
  },
  transformOrigin: simple("transform-origin", "position"),

  // ── interaction ──────────────────────────────────────────────────────────
  cursor: enumProp("cursor", ["auto", "pointer", "default", "not-allowed"]),
  pointerEvents: enumProp("pointer-events", ["auto", "none"]),
  userSelect: enumProp("user-select", ["auto", "none", "text"]),
};

/** Every property the engine can emit. Used by the validator as the whitelist. */
export const ALLOWED_STYLE_PROPS = Object.keys(EMITTERS) as StylePropKey[];

/**
 * Palette background token → the readable text token that pairs with it.
 * An element painted with one of these backgrounds, but with no explicit text
 * colour of its own, inherits the wrong colour (usually the card's body text,
 * which is tuned for the card background, not for a solid button). Auto-pairing
 * the "on" colour here keeps every button/badge legible without the template
 * author having to set the text colour on each one — and it follows through to
 * a Pro user's override, because both sides are CSS variables.
 */
const ON_COLOR_PAIR: Record<string, string> = {
  primary: "--c-onPrimary",
};

/** If `colorVal` is a `{color.X}` ref with an "on" pair, return that CSS var. */
function pairedOnColorVar(colorVal: unknown): string | null {
  if (typeof colorVal !== "string") return null;
  const m = /^\{color\.([A-Za-z0-9_-]+)\}$/.exec(colorVal.trim());
  return m ? (ON_COLOR_PAIR[m[1]] ?? null) : null;
}

/**
 * Turn one `StyleProps` object into an ordered declaration list.
 * Emission order follows `EMITTERS` insertion order, so output is stable and
 * the content hash only changes when the design actually changes.
 */
export function declarationsFor(props: StyleProps | undefined): Decl[] {
  if (!props || typeof props !== "object") return [];
  const out: Decl[] = [];
  for (const key of ALLOWED_STYLE_PROPS) {
    if (key === "textGradient") continue;
    const value = (props as Record<string, unknown>)[key];
    if (value === undefined || value === null || value === "") continue;
    const emit = EMITTERS[key];
    if (!emit) continue;
    for (const decl of emit(value)) out.push(decl);
  }

  // Auto on-colour: a solid palette background (e.g. {color.primary}) with no
  // explicit text colour gets the paired readable colour (e.g. onPrimary), so
  // labels stay legible on coloured buttons/badges by default.
  const p = props as Record<string, unknown>;
  const hasExplicitColor =
    p.color !== undefined && p.color !== null && p.color !== "";
  const bg = p.background as { kind?: string; color?: unknown } | undefined;
  if (!hasExplicitColor && bg && typeof bg === "object" && bg.kind === "color") {
    const onVar = pairedOnColorVar(bg.color);
    if (onVar) out.push(["color", `var(${onVar})`]);
  }

  // Gradient text / icons. Text: the gradient is a background layer clipped
  // to the glyphs (an existing background stays underneath as a 2nd layer).
  // Icons: `--ts-paint` feeds the SVG paint rules in the reset layer.
  const grad = textGradientCss(p.textGradient);
  if (grad) {
    const at = out.findIndex(([k]) => k === "background-image");
    const layers = [grad.image];
    const clips = ["text"];
    if (at >= 0) {
      layers.push(out[at][1]);
      clips.push("padding-box");
      out.splice(at, 1);
    } else if (out.some(([k]) => k === "background-color")) {
      // background-color follows the LAST layer's clip — give it a clear
      // full-box layer so a solid background isn't clipped to the text.
      layers.push("linear-gradient(transparent, transparent)");
      clips.push("padding-box");
    }
    out.push(
      ["background-image", layers.join(", ")],
      ["-webkit-background-clip", clips.join(", ")],
      ["background-clip", clips.join(", ")],
      ["-webkit-text-fill-color", "transparent"],
      ["--ts-paint", `url(#${grad.id}) ${grad.first}`],
    );
    if (!hasExplicitColor) out.push(["color", grad.first]);
  } else if (hasExplicitColor && out.some(([k]) => k === "color")) {
    // A solid colour inside a gradient parent paints solid again.
    out.push(["-webkit-text-fill-color", "currentColor"], ["--ts-paint", "initial"]);
  }

  // "Fixed" size means fixed: inside a flex row the default flex-shrink:1
  // squeezed a 50×50 frame's width but not its height, breaking its ratio.
  const isFixedLength = (v: unknown) =>
    typeof v === "string" && /^\d+(\.\d+)?(px|rem|em)$/.test(v.trim());
  const hasExplicitShrink =
    p.flexShrink !== undefined && p.flexShrink !== null && p.flexShrink !== "";
  if (!hasExplicitShrink && (isFixedLength(p.width) || isFixedLength(p.height))) {
    out.push(["flex-shrink", "0"]);
  }

  // Auto text-align for centered or aligned flex columns:
  // When a flex container is column-oriented and centered (alignItems: center),
  // block-level text children (<p>, <h3>) wrap by default with text-align: left unless text-align: center
  // is inherited from the container. Setting text-align ensures multi-line text matches the container's alignment.
  if (
    (p.flexDirection === "column" || p.flexDirection === "column-reverse" || !p.flexDirection) &&
    !p.textAlign
  ) {
    if (p.alignItems === "center") {
      out.push(["text-align", "center"]);
    } else if (p.alignItems === "flex-end" || p.alignItems === "end") {
      out.push(["text-align", "right"]);
    }
  }

  return out;
}

/** `[["color","red"]]` → `color:red` */
export function serializeDecls(decls: Decl[], pretty = false): string {
  if (!decls.length) return "";
  return pretty
    ? decls.map(([p, v]) => `  ${p}: ${v};`).join("\n")
    : decls.map(([p, v]) => `${p}:${v}`).join(";");
}

// ─── Gradient text / icon colour ─────────────────────────────────────────────

export interface CompiledTextGradient {
  /** Stable id of the SVG <linearGradient> that paints icons. */
  id: string;
  /** `linear-gradient(...)` for text. */
  image: string;
  /** First stop — the solid fallback. */
  first: string;
  angle: number;
  stops: { color: string; offset: string | null }[];
}

function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** TextGradientValue → CSS + SVG pieces, or null when it isn't usable. */
export function textGradientCss(v: unknown): CompiledTextGradient | null {
  if (!v || typeof v !== "object") return null;
  const tg = v as { angle?: unknown; stops?: unknown };
  if (!Array.isArray(tg.stops)) return null;
  const stops = tg.stops
    .slice(0, 8)
    .map((s: any) => {
      const c = color(s?.color);
      if (!c) return null;
      const at = s?.at !== undefined ? cssValue(s.at, "length") : null;
      return { color: c, offset: at && /%$/.test(at) ? at : null, at };
    })
    .filter((x): x is { color: string; offset: string | null; at: string | null } => !!x);
  if (stops.length < 2) return null;
  const angle = Number.isFinite(tg.angle) ? Math.round(tg.angle as number) : 90;
  const image = `linear-gradient(${angle}deg, ${stops
    .map((s) => (s.at ? `${s.color} ${s.at}` : s.color))
    .join(", ")})`;
  return {
    id: `tsg-${hashString(image)}`,
    image,
    first: stops[0].color,
    angle,
    stops: stops.map(({ color: c, offset }) => ({ color: c, offset })),
  };
}
