"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColor = parseColor;
exports.blendOverWhite = blendOverWhite;
exports.relativeLuminance = relativeLuminance;
exports.contrastRatio = contrastRatio;
exports.contrastText = contrastText;
exports.rgbString = rgbString;
exports.withAlpha = withAlpha;
exports.mix = mix;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const to255 = (n) => clamp(Math.round(n), 0, 255);
/**
 * Parse a CSS colour into {r,g,b,a}. Supports:
 *   #rgb  #rgba  #rrggbb  #rrggbbaa
 *   rgb(r,g,b)  rgba(r,g,b,a)  (comma or space separated, `/` alpha)
 * Returns null on anything it can't confidently read.
 */
function parseColor(input) {
    if (typeof input !== "string")
        return null;
    const s = input.trim().toLowerCase();
    if (!s)
        return null;
    // Hex
    if (s[0] === "#") {
        const hex = s.slice(1);
        if (!/^[0-9a-f]+$/.test(hex))
            return null;
        const expand = (h) => h
            .split("")
            .map((c) => c + c)
            .join("");
        let r, g, b, a = 1;
        if (hex.length === 3 || hex.length === 4) {
            const full = expand(hex);
            r = parseInt(full.slice(0, 2), 16);
            g = parseInt(full.slice(2, 4), 16);
            b = parseInt(full.slice(4, 6), 16);
            if (hex.length === 4)
                a = parseInt(full.slice(6, 8), 16) / 255;
        }
        else if (hex.length === 6 || hex.length === 8) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            if (hex.length === 8)
                a = parseInt(hex.slice(6, 8), 16) / 255;
        }
        else {
            return null;
        }
        return { r, g, b, a };
    }
    // rgb()/rgba()
    const m = /^rgba?\(([^)]+)\)$/.exec(s);
    if (m) {
        const parts = m[1].split(/[,/\s]+/).filter(Boolean);
        if (parts.length < 3)
            return null;
        const num = (p) => p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p);
        const r = num(parts[0]);
        const g = num(parts[1]);
        const b = num(parts[2]);
        let a = 1;
        if (parts[3] != null) {
            a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
        }
        if ([r, g, b, a].some((n) => Number.isNaN(n)))
            return null;
        return { r: to255(r), g: to255(g), b: to255(b), a: clamp(a, 0, 1) };
    }
    return null;
}
/** Flatten any alpha onto a white backdrop → the effective visible colour. */
function blendOverWhite(c, backdrop = { r: 255, g: 255, b: 255 }) {
    const a = clamp(c.a, 0, 1);
    return {
        r: to255(c.r * a + backdrop.r * (1 - a)),
        g: to255(c.g * a + backdrop.g * (1 - a)),
        b: to255(c.b * a + backdrop.b * (1 - a)),
    };
}
/** WCAG relative luminance (0 = black, 1 = white) for an opaque colour. */
function relativeLuminance(c) {
    const chan = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * chan(c.r) + 0.7152 * chan(c.g) + 0.0722 * chan(c.b);
}
/** Contrast ratio between two opaque colours (1..21). */
function contrastRatio(a, b) {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}
/**
 * Pick the more readable text colour for a background. `bg` may carry alpha;
 * it is flattened over white first. Chooses whichever of dark/light has the
 * higher contrast ratio (so mid-tones resolve correctly, not just by a 0.5
 * luminance cutoff).
 */
function contrastText(bg, opts = {}) {
    const dark = opts.dark ?? "#111827";
    const light = opts.light ?? "#FFFFFF";
    const flat = "a" in bg ? blendOverWhite(bg) : bg;
    const darkRgb = parseColor(dark);
    const lightRgb = parseColor(light);
    return contrastRatio(flat, darkRgb) >= contrastRatio(flat, lightRgb) ? dark : light;
}
/** `rgb(a)` string. Alpha omitted when 1. */
function rgbString(c) {
    const a = "a" in c ? c.a : 1;
    return a >= 1
        ? `rgb(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)})`
        : `rgba(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)}, ${round(a)})`;
}
/** Same solid colour at a new alpha → `rgba(...)`. */
function withAlpha(c, alpha) {
    return `rgba(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)}, ${round(clamp(alpha, 0, 1))})`;
}
/**
 * Blend two opaque colours by ratio (0 → a, 1 → b). Used to derive a muted
 * text colour by pulling the text partway toward the background.
 */
function mix(a, b, ratio) {
    const t = clamp(ratio, 0, 1);
    return {
        r: to255(a.r + (b.r - a.r) * t),
        g: to255(a.g + (b.g - a.g) * t),
        b: to255(a.b + (b.b - a.b) * t),
    };
}
function round(n) {
    return Math.round(n * 1000) / 1000;
}
