/**
 * Multi-colour + gradient recolouring for uploaded SVG icons.
 *
 * An uploaded SVG keeps its own colours by default. Each distinct colour it
 * uses is a "slot" (1st colour, 2nd colour, …) that a template designer can
 * repaint with a fixed colour, a theme token ({color.primary}) or a linear
 * gradient. Pure string work — runs the same on the server (SSR) and in the
 * browser — and the result still goes through the SVG sanitizer.
 */
/** One stop of a gradient paint. */
export interface IconGradientStop {
    color: string;
    /** 0–100 (%). Spread evenly when omitted. */
    offset?: number;
}
/** What a colour slot is painted with. */
export type IconPaint = string | {
    kind: "linear";
    /** Degrees, 0 = left → right, 90 = top → bottom. */
    angle?: number;
    stops: IconGradientStop[];
};
/** Most SVG icons use a handful of colours; more than this is an illustration. */
export declare const MAX_ICON_COLOR_SLOTS = 12;
/**
 * Many exported SVGs (Illustrator, Figma) colour shapes through `style="…"`
 * or a `<style>` block with classes — both of which the sanitizer drops.
 * Move those fill/stroke/stop-color values onto plain attributes first so the
 * colours survive (and become recolourable slots).
 */
export declare function inlineSvgStyles(svg: string): string;
/** The distinct colours an SVG paints with, in first-use order (its slots). */
export declare function svgColorSlots(svg: string): string[];
/**
 * Repaint an SVG's colour slots. `paints[i]` replaces slot i (see
 * `svgColorSlots`); a missing/invalid paint keeps the original colour.
 * `uid` keeps gradient ids unique when one page shows many icons.
 */
export declare function recolorSvg(svg: string, paints: ReadonlyArray<IconPaint | null | undefined> | null | undefined, uid?: string): string;
