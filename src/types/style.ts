/**
 * Style types — the closed vocabulary an admin can express in a template.
 *
 * Two hard rules make the whole engine safe:
 *   1. `StyleProps` is a WHITELIST. A property that isn't here cannot be
 *      authored, cannot be stored, and cannot be emitted by the compiler.
 *   2. Every value is either a literal (`"16px"`, `"#3B5BFE"`) or a TOKEN REF
 *      (`"{color.primary}"`). Token refs compile to `var(--c-primary)`, which
 *      is what lets a Pro user recolour a locked design without touching it.
 *
 * Nothing in this file imports React or Node — it is shared verbatim by the
 * NestJS backend, the Next.js frontends and (eventually) the Expo app.
 */

/** `"{color.primary}"`, `"{space.4}"`, `"{radius.lg}"` … */
export type TokenRef = string;

/** A literal CSS value or a token reference. Validated per-property. */
export type StyleValue = string | number;

/**
 * Breakpoints are DESKTOP-FIRST:
 *   • `base` is Desktop — unconditional, applies at every width, and is the
 *     layer an admin designs in first. Everything cascades down from it.
 *   • `md` is Tablet and `sm` is Mobile — each OVERRIDES the desktop base
 *     *below* its threshold via a `max-width` media query.
 */
export type Breakpoint = 'base' | 'sm' | 'md';
export type StyleState = 'hover' | 'active' | 'focus';

/** Breakpoint max-widths, in px. `base` (Desktop) is unconditional. */
export const BREAKPOINTS: Record<Exclude<Breakpoint, 'base'>, number> = {
  sm: 380, // Mobile   — overrides below 380px
  md: 768, // Tablet   — overrides below 768px
};

/**
 * Order the compiler emits layers in. Desktop base first, then each override in
 * DESCENDING max-width (Tablet before Mobile) so the narrower breakpoint wins by
 * source order — both media queries carry equal specificity.
 */
export const BREAKPOINT_ORDER: Breakpoint[] = ['base', 'md', 'sm'];

/** `max-width` media condition per override breakpoint. */
export const BREAKPOINT_MEDIA: Record<Exclude<Breakpoint, 'base'>, string> = {
  md: `(max-width:${BREAKPOINTS.md}px)`,
  sm: `(max-width:${BREAKPOINTS.sm}px)`,
};

export const BREAKPOINT_KEYS: Breakpoint[] = ['base', 'sm', 'md'];
export const STATE_KEYS: StyleState[] = ['hover', 'active', 'focus'];

// ─── Composite value shapes ──────────────────────────────────────────────────

/** Per-side box value. Omitted sides are simply not emitted. */
export interface Box4 {
  t?: StyleValue;
  r?: StyleValue;
  b?: StyleValue;
  l?: StyleValue;
  /** Shorthand — applied to every side, overridden by explicit sides. */
  all?: StyleValue;
}

/** Per-corner radius. */
export interface Corners4 {
  tl?: StyleValue;
  tr?: StyleValue;
  br?: StyleValue;
  bl?: StyleValue;
  all?: StyleValue;
}

export interface BorderValue {
  width?: StyleValue;
  style?: 'solid' | 'dashed' | 'dotted' | 'none';
  color?: StyleValue;
  /** Per-side override; when present, `width/style/color` act as the default. */
  sides?: Partial<
    Record<'t' | 'r' | 'b' | 'l', { width?: StyleValue; style?: string; color?: StyleValue }>
  >;
}

export type BackgroundValue =
  | { kind: 'color'; color: StyleValue }
  | {
      kind: 'gradient';
      angle?: number;
      stops: { color: StyleValue; at?: StyleValue }[];
    }
  | {
      kind: 'image';
      url: string;
      size?: 'cover' | 'contain' | 'auto';
      position?: string;
      repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
      /** Optional colour painted underneath the image. */
      color?: StyleValue;
    };

export interface ShadowValue {
  x: StyleValue;
  y: StyleValue;
  blur: StyleValue;
  spread?: StyleValue;
  color: StyleValue;
  inset?: boolean;
}

export interface TransitionValue {
  property: string[];
  /** Milliseconds. */
  duration: number;
  easing?: string;
  delay?: number;
}

export interface TransformValue {
  translateX?: StyleValue;
  translateY?: StyleValue;
  scale?: number;
  rotate?: number;
}

// ─── The whitelist ───────────────────────────────────────────────────────────

export interface StyleProps {
  // layout
  display?: 'flex' | 'grid' | 'block' | 'inline-flex' | 'inline-block' | 'none' | 'contents';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: string;
  alignItems?: string;
  alignSelf?: string;
  gap?: StyleValue;
  rowGap?: StyleValue;
  columnGap?: StyleValue;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: StyleValue;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  order?: number;

  // positioning
  position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed';
  top?: StyleValue;
  right?: StyleValue;
  bottom?: StyleValue;
  left?: StyleValue;
  zIndex?: number;
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll' | 'clip';
  overflowX?: 'visible' | 'hidden' | 'auto' | 'scroll' | 'clip';
  overflowY?: 'visible' | 'hidden' | 'auto' | 'scroll' | 'clip';
  isolation?: 'auto' | 'isolate';

  // box model
  width?: StyleValue;
  minWidth?: StyleValue;
  maxWidth?: StyleValue;
  height?: StyleValue;
  minHeight?: StyleValue;
  maxHeight?: StyleValue;
  aspectRatio?: string;
  padding?: Box4;
  margin?: Box4;

  // typography
  fontFamily?: StyleValue;
  fontSize?: StyleValue;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  lineHeight?: StyleValue;
  letterSpacing?: StyleValue;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  whiteSpace?: 'normal' | 'nowrap' | 'pre-line' | 'pre-wrap';
  wordBreak?: 'normal' | 'break-word' | 'break-all';
  /** Compiles to the `-webkit-line-clamp` trio. */
  lineClamp?: number;
  color?: StyleValue;

  // decoration
  background?: BackgroundValue;
  border?: BorderValue;
  borderRadius?: Corners4;
  boxShadow?: ShadowValue | ShadowValue[] | TokenRef;
  opacity?: number;
  backdropBlur?: StyleValue;
  filter?: string;
  mixBlendMode?: string;
  clipPath?: string;

  // media
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // motion
  transition?: TransitionValue;
  transform?: TransformValue;
  transformOrigin?: string;

  // interaction
  cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
  pointerEvents?: 'auto' | 'none';
  userSelect?: 'auto' | 'none' | 'text';
}

export type StylePropKey = keyof StyleProps;

/**
 * A node's full style: one desktop `base` layer, optional smaller-breakpoint
 * override layers (`max-width`, desktop-first) and optional interaction states.
 */
export interface StyleSet {
  base?: StyleProps;
  sm?: StyleProps;
  md?: StyleProps;
  hover?: StyleProps;
  active?: StyleProps;
  focus?: StyleProps;
}

export const EMPTY_STYLE_SET: StyleSet = Object.freeze({ base: {} });
