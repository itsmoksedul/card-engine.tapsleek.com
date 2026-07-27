/**
 * StyleProps → CSS declarations.
 *
 * Driven by an explicit table: a property that isn't in `EMITTERS` produces
 * nothing, no matter what is stored in the JSON. Adding a property to the
 * engine means adding a row here AND to the `StyleProps` interface AND to the
 * validator — three deliberate edits, never an accident.
 */
import type { StyleProps, StylePropKey } from '../types/style';
export type Decl = [property: string, value: string];
type Emitter = (value: any) => Decl[];
export declare const EMITTERS: Partial<Record<StylePropKey, Emitter>>;
/** Every property the engine can emit. Used by the validator as the whitelist. */
export declare const ALLOWED_STYLE_PROPS: StylePropKey[];
/**
 * Turn one `StyleProps` object into an ordered declaration list.
 * Emission order follows `EMITTERS` insertion order, so output is stable and
 * the content hash only changes when the design actually changes.
 */
export declare function declarationsFor(props: StyleProps | undefined): Decl[];
/** `[["color","red"]]` → `color:red` */
export declare function serializeDecls(decls: Decl[], pretty?: boolean): string;
export {};
