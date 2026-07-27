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
exports.EMPTY_STYLE_SET = exports.STATE_KEYS = exports.BREAKPOINT_KEYS = exports.BREAKPOINTS = void 0;
/** Breakpoint min-widths, in px. `base` is unconditional. */
exports.BREAKPOINTS = {
    sm: 380,
    md: 768,
};
exports.BREAKPOINT_KEYS = ['base', 'sm', 'md'];
exports.STATE_KEYS = ['hover', 'active', 'focus'];
exports.EMPTY_STYLE_SET = Object.freeze({ base: {} });
