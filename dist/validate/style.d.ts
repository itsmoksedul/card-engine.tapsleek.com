/**
 * Style validation.
 *
 * The trick here: the COMPILER is the validator. A style value is valid iff
 * `declarationsFor({ [key]: value })` produces at least one declaration. That
 * makes it structurally impossible for the validator and the compiler to
 * disagree — there is exactly one table of truth (`EMITTERS`), and a value the
 * compiler would silently drop is rejected at write time instead.
 */
import { type StyleSet } from '../types/style';
export interface StyleIssue {
    path: string;
    message: string;
}
export declare function validateStyleProps(props: unknown, path: string, issues: StyleIssue[]): void;
export declare function validateStyleSet(set: unknown, path: string, issues: StyleIssue[]): void;
/**
 * Strip everything the compiler would drop, so what lands in the DB is exactly
 * what renders. Used on draft autosave, where we want tolerance rather than
 * rejection.
 */
export declare function sanitizeStyleSet(set: StyleSet | undefined): StyleSet | undefined;
