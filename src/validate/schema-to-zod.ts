/**
 * FieldSchema[] → a runtime validator.
 *
 * This is the function that means a new widget needs ZERO backend code. The
 * same schema that renders the user's form is compiled to a zod schema that
 * guards `PATCH /v1/cards/:id/content`, lints a template's `defaultContent` on
 * publish, and checks a widget's `design` object against its `designSchema`.
 */

import { z } from 'zod';
import { FIELD_LIMITS, type FieldSchema } from '../types/field';

/** URLs we accept in a `url` field — no javascript:, no data: (except vCard). */
const URL_RE =
  /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[0-9()\s-]+|sms:\+?[0-9()\s-]+|\/[^\s]*|#[A-Za-z0-9_-]+)$/i;

const HEX_OR_TOKEN_RE = /^#[0-9A-Fa-f]{3,8}$|^\{color\.[A-Za-z0-9_-]+\}(?:\/\d+(?:\.\d+)?%?)?$|^$/;
const ICON_RE = /^[A-Za-z0-9_-]{0,64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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
export function schemaToZod(
  fields: FieldSchema[],
  options: SchemaToZodOptions = {},
): z.ZodType<Record<string, unknown>> {
  const partial = options.partial ?? true;
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema = fieldToZod(field, options);
    // `required` only bites when the caller asked for a complete object.
    if (partial || !field.required) schema = schema.optional();
    shape[field.key] = schema;
  }

  // Unknown keys are stripped rather than rejected: a card edited on an older
  // client shouldn't 400 because the widget gained a field since.
  return z.object(shape).strip() as unknown as z.ZodType<Record<string, unknown>>;
}

function fieldToZod(field: FieldSchema, options: SchemaToZodOptions): z.ZodTypeAny {
  switch (field.type) {
    case 'text':
    case 'textarea': {
      let s = z.string().max(Math.min(field.max ?? 500, FIELD_LIMITS.textMax));
      if (field.min) s = s.min(field.min);
      if (field.pattern) {
        try {
          s = s.regex(new RegExp(field.pattern));
        } catch {
          /* an invalid pattern in a widget meta is a dev bug, not a user error */
        }
      }
      return field.required ? s.min(Math.max(1, field.min ?? 1)) : s;
    }

    case 'url':
      return z
        .string()
        .max(2000)
        .refine((v) => v === '' || URL_RE.test(v), 'must be a valid URL');

    case 'email':
      return z
        .string()
        .max(320)
        .refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'must be an email');

    case 'tel':
      return z
        .string()
        .max(40)
        .refine((v) => v === '' || /^\+?[0-9()\s-]{4,}$/.test(v), 'must be a phone number');

    case 'richtext':
      // Shape only. Sanitisation happens separately, on the server, on write.
      return z.string().max(Math.min(field.max ?? 5000, FIELD_LIMITS.richtextMax));

    case 'number': {
      let s = z.number().finite();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      return s;
    }

    case 'boolean':
      return z.boolean();

    case 'select': {
      const values = field.options.map((o) => String(o.value));
      const one = z.coerce.string().refine((v) => values.includes(v), {
        message: `must be one of: ${values.join(', ')}`,
      });
      return field.multiple ? z.array(one).max(values.length) : one;
    }

    case 'color':
      return z.string().max(64).regex(HEX_OR_TOKEN_RE, 'must be a hex colour or a colour token');

    case 'image':
      return z
        .string()
        .max(2000)
        .refine((v) => v === '' || isAllowedImage(v, options.imageHosts), 'image host not allowed');

    case 'icon':
      return z.union([
        z.string().regex(ICON_RE, 'invalid icon key'),
        z.object({
          type: z.string(),
          name: z.string().max(100).optional(),
          url: z.string().max(2000).optional(),
          svg: z.string().max(100000).optional(),
        })
      ]);

    case 'date':
      return z.string().refine((v) => v === '' || DATE_RE.test(v), 'must be YYYY-MM-DD');

    case 'time':
      return z.string().refine((v) => v === '' || TIME_RE.test(v), 'must be HH:MM');

    case 'reference': {
      const one = z.string().refine((v) => v === '' || UUID_RE.test(v), 'must be an id');
      return field.multiple ? z.array(one).max(50) : one.nullable();
    }

    case 'repeater': {
      const item = schemaToZod(field.fields, { ...options, partial: false });
      let s = z.array(item).max(Math.min(field.max ?? 20, FIELD_LIMITS.repeaterMax));
      if (field.min) s = s.min(field.min);
      return s;
    }

    case 'group':
      return schemaToZod(field.fields, options);

    default:
      return z.unknown();
  }
}

function isAllowedImage(url: string, hosts?: string[]): boolean {
  if (!/^https:\/\//i.test(url)) return false;
  if (!hosts?.length) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return hosts.some((h) => {
      const allowed = h.toLowerCase().replace(/^\*\./, '');
      return host === allowed || host.endsWith(`.${allowed}`);
    });
  } catch {
    return false;
  }
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

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
export function validateAgainstSchema(
  fields: FieldSchema[],
  value: unknown,
  options: SchemaToZodOptions = {},
): ValidationResult<Record<string, unknown>> {
  const schema = schemaToZod(fields, options);
  const parsed = schema.safeParse(value ?? {});
  if (parsed.success) return { ok: true, value: parsed.data, issues: [] };
  return {
    ok: false,
    value: null,
    issues: parsed.error.issues.map((i) => ({
      path: i.path.join('.') || '(root)',
      message: i.message,
    })),
  };
}

/**
 * Cheap structural guard applied before zod: rejects payloads that are
 * pathologically large or deep, so a hostile body can't burn CPU in the parser.
 */
export function guardPayload(value: unknown, maxBytes = 64_000): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let json: string;
  try {
    json = JSON.stringify(value ?? null);
  } catch {
    return [{ path: '(root)', message: 'value is not serializable' }];
  }
  if (json.length > maxBytes) {
    issues.push({ path: '(root)', message: `payload too large (${json.length} > ${maxBytes} bytes)` });
  }
  if (depthOf(value) > FIELD_LIMITS.depth + 2) {
    issues.push({ path: '(root)', message: 'payload nested too deeply' });
  }
  return issues;
}

function depthOf(value: unknown, depth = 0): number {
  if (depth > 24) return depth;
  if (value === null || typeof value !== 'object') return depth;
  let max = depth;
  for (const v of Object.values(value as Record<string, unknown>)) {
    const d = depthOf(v, depth + 1);
    if (d > max) max = d;
  }
  return max;
}
