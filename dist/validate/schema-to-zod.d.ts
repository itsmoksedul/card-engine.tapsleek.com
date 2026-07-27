/**
 * FieldSchema[] → a runtime validator.
 *
 * This is the function that means a new widget needs ZERO backend code. The
 * same schema that renders the user's form is compiled to a zod schema that
 * guards `PATCH /v1/cards/:id/content`, lints a template's `defaultContent` on
 * publish, and checks a widget's `design` object against its `designSchema`.
 */
import { z } from 'zod';
import { type FieldSchema } from '../types/field';
export interface SchemaToZodOptions {
    /**
     * Media hosts an `image` field may point at. When omitted, any https URL is
     * accepted (dev). Production passes the R2 domain plus any allowlist.
     */
    imageHosts?: string[];
    /** Treat every field as optional (partial patches). Default true. */
    partial?: boolean;
}
/** Build a zod object schema for one field list. */
export declare function schemaToZod(fields: FieldSchema[], options?: SchemaToZodOptions): z.ZodType<Record<string, unknown>>;
export interface ValidationIssue {
    path: string;
    message: string;
}
export interface ValidationResult<T> {
    ok: boolean;
    value: T | null;
    issues: ValidationIssue[];
}
/** Validate a value against a field list, returning issues rather than throwing. */
export declare function validateAgainstSchema(fields: FieldSchema[], value: unknown, options?: SchemaToZodOptions): ValidationResult<Record<string, unknown>>;
/**
 * Cheap structural guard applied before zod: rejects payloads that are
 * pathologically large or deep, so a hostile body can't burn CPU in the parser.
 */
export declare function guardPayload(value: unknown, maxBytes?: number): ValidationIssue[];
