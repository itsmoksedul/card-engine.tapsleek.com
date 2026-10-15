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
/** Breakpoint max-widths, in px. `base` (Desktop) is unconditional. */
export const BREAKPOINTS = {
    sm: 480, // Mobile   — overrides below 480px (covers all mobile devices)
    md: 768, // Tablet   — overrides below 768px
};
/**
 * Order the compiler emits layers in. Desktop base first, then each override in
 * DESCENDING max-width (Tablet before Mobile) so the narrower breakpoint wins by
 * source order — both media queries carry equal specificity.
 */
export const BREAKPOINT_ORDER = ["base", "md", "sm"];
/** `max-width` media condition per override breakpoint. */
export const BREAKPOINT_MEDIA = {
    md: `(max-width:${BREAKPOINTS.md}px)`,
    sm: `(max-width:${BREAKPOINTS.sm}px)`,
};
export const BREAKPOINT_KEYS = ["base", "sm", "md"];
// first/last are emitted before the interaction states so hover still wins.
export const STATE_KEYS = ["first", "last", "hover", "active", "focus"];
/**
 * The selector for a state layer. Handles comma-separated selector lists.
 * first/last also match the `is-first`/`is-last` classes the renderer puts on
 * repeated items, which work even when the list shares its parent with other
 * layers.
 */
export function stateSelector(selector, state) {
    return selector
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .flatMap((s) => state === "first"
        ? [`${s}:first-child`, `${s}.is-first`]
        : state === "last"
            ? [`${s}:last-child`, `${s}.is-last`]
            : [`${s}:${state}`])
        .join(", ");
}
export const EMPTY_STYLE_SET = Object.freeze({ base: {} });
