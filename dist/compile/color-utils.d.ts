/**
 * color-utils — tiny, dependency-free colour math for theme derivation.
 *
 * Runs in BOTH the publish step and the browser live-preview, so it must not
 * touch any Node global. Everything here is pure.
 *
 * Used by `compileCardTheme` (and the app's `themeVars`) to turn a single user
 * choice into a readable set of tokens:
 *   - a background tint from the Card Theme colour, with text auto-contrasted
 *   - a solid button colour, with its label auto-contrasted
 */
export interface Rgb {
    r: number;
    g: number;
    b: number;
}
export interface Rgba extends Rgb {
    a: number;
}
/**
 * Parse a CSS colour into {r,g,b,a}. Supports:
 *   #rgb  #rgba  #rrggbb  #rrggbbaa
 *   rgb(r,g,b)  rgba(r,g,b,a)  (comma or space separated, `/` alpha)
 * Returns null on anything it can't confidently read.
 */
export declare function parseColor(input: unknown): Rgba | null;
/** Flatten any alpha onto a white backdrop → the effective visible colour. */
export declare function blendOverWhite(c: Rgba, backdrop?: Rgb): Rgb;
/** WCAG relative luminance (0 = black, 1 = white) for an opaque colour. */
export declare function relativeLuminance(c: Rgb): number;
/** Contrast ratio between two opaque colours (1..21). */
export declare function contrastRatio(a: Rgb, b: Rgb): number;
/**
 * Pick the more readable text colour for a background. `bg` may carry alpha;
 * it is flattened over white first. Chooses whichever of dark/light has the
 * higher contrast ratio (so mid-tones resolve correctly, not just by a 0.5
 * luminance cutoff).
 */
export declare function contrastText(bg: Rgba | Rgb, opts?: {
    dark?: string;
    light?: string;
}): string;
/** `rgb(a)` string. Alpha omitted when 1. */
export declare function rgbString(c: Rgb | Rgba): string;
/** Same solid colour at a new alpha → `rgba(...)`. */
export declare function withAlpha(c: Rgb, alpha: number): string;
/**
 * Blend two opaque colours by ratio (0 → a, 1 → b). Used to derive a muted
 * text colour by pulling the text partway toward the background.
 */
export declare function mix(a: Rgb, b: Rgb, ratio: number): Rgb;
