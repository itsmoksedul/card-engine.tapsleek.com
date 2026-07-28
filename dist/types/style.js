"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_STYLE_SET = exports.STATE_KEYS = exports.BREAKPOINT_KEYS = exports.BREAKPOINT_MEDIA = exports.BREAKPOINT_ORDER = exports.BREAKPOINTS = void 0;
/** Breakpoint max-widths, in px. `base` (Desktop) is unconditional. */
exports.BREAKPOINTS = {
    sm: 380, // Mobile   — overrides below 380px
    md: 768, // Tablet   — overrides below 768px
};
/**
 * Order the compiler emits layers in. Desktop base first, then each override in
 * DESCENDING max-width (Tablet before Mobile) so the narrower breakpoint wins by
 * source order — both media queries carry equal specificity.
 */
exports.BREAKPOINT_ORDER = ['base', 'md', 'sm'];
/** `max-width` media condition per override breakpoint. */
exports.BREAKPOINT_MEDIA = {
    md: `(max-width:${exports.BREAKPOINTS.md}px)`,
    sm: `(max-width:${exports.BREAKPOINTS.sm}px)`,
};
exports.BREAKPOINT_KEYS = ['base', 'sm', 'md'];
exports.STATE_KEYS = ['hover', 'active', 'focus'];
exports.EMPTY_STYLE_SET = Object.freeze({ base: {} });
