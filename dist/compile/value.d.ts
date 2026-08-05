/**
 * Value layer — turns authored style values into CSS text.
 *
 * The compiler is a GENERATOR, not a pass-through: every value that reaches
 * CSS is either produced by one of these serializers or dropped. There is no
 * code path that copies an arbitrary author string into a declaration, which
 * is why `expression()`, `url(javascript:…)` and `@import` can never appear.
 */
import { type TokenGroup } from '../types/definition';
import type { BackgroundValue, BorderValue, Box4, Corners4, ShadowValue, StyleValue, TransformValue, TransitionValue } from '../types/style';
/** Safe CSS identifier — token names and node ids are held to this. */
export declare const IDENT_RE: RegExp;
export declare const VALUE_RE: {
    /** Lengths, percentages and the keywords we allow in their place. */
    readonly length: RegExp;
    readonly color: RegExp;
    /** Unitless numbers, used for line-height / opacity / z-index. */
    readonly number: RegExp;
    /** Font stacks: quoted or bare families separated by commas. */
    readonly fontFamily: RegExp;
    readonly aspectRatio: RegExp;
    /** Grid track lists — digits, fr/px/%, minmax, repeat, auto keywords. */
    readonly gridTemplate: RegExp;
    /** Free-form but heavily restricted: alignment keywords only. */
    readonly keyword: RegExp;
    /** Percentages and keywords for background/object position. */
    readonly position: RegExp;
    /** Cubic-bezier / steps / named easings. */
    readonly easing: RegExp;
    /** blend modes, cursor, etc. */
    readonly simpleKeyword: RegExp;
};
export type ValueKind = keyof typeof VALUE_RE;
export declare function isTokenRef(v: unknown): v is string;
export declare function parseTokenRef(v: string): {
    group: TokenGroup;
    name: string;
} | null;
/** `{color.primary}` → `var(--c-primary)`. */
export declare function tokenVar(group: TokenGroup, name: string): string;
/**
 * Resolve one scalar value to CSS text, or `null` if it fails validation.
 * A token ref always wins — its literal value is validated once, at the token
 * table, not at every use site.
 */
export declare function cssValue(v: StyleValue | undefined, kind: ValueKind): string | null;
/** A length that may also be a raw number (interpreted as px). */
export declare function len(v: StyleValue | undefined): string | null;
export declare function color(v: StyleValue | undefined): string | null;
/**
 * Box4 → `padding` / `margin`. Emits the 4-value shorthand so a later
 * breakpoint that changes one side still produces a complete, predictable box.
 */
export declare function box4(b: Box4 | string | number | undefined): string | null;
/** Corners4 → `border-radius`. */
export declare function corners4(c: Corners4 | string | number | undefined): string | null;
/** BorderValue → one or more declarations. */
export declare function border(b: BorderValue | undefined): [string, string][];
/** BackgroundValue → declarations. Image URLs must already be allowlisted. */
export declare function background(bg: BackgroundValue | undefined): [string, string][];
/** Only https/protocol-relative, and no quote or paren injection. */
export declare function safeUrl(u: unknown): string | null;
/** ShadowValue(s) → one `box-shadow` value. A token ref passes straight through. */
export declare function shadow(sh: ShadowValue | ShadowValue[] | string | undefined): string | null;
export declare function transition(t: TransitionValue | undefined): string | null;
export declare function transform(t: TransformValue | undefined): string | null;
export declare function clamp(n: number, min: number, max: number): number;
export declare function utf8Bytes(input: string): number;
