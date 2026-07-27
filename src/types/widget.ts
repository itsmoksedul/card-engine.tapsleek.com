/**
 * WidgetMeta — the JSON-serializable half of a widget.
 *
 * A widget is deliberately split in two:
 *   meta.ts    (this shape)  pure data — imported by NestJS AND every frontend
 *   Render.tsx               React only — imported by frontends only
 *
 * That split is what lets the backend validate user content, lint a template
 * on publish and serve the builder palette (`GET /admin/widgets`) without ever
 * importing React. It also guarantees the palette can't drift from the
 * implementations, because it IS the implementations' metadata.
 *
 * NOTE: `iconName` is a string (a lucide key), never a component — the
 * manifest has to survive JSON.stringify.
 */

import type { FieldSchema } from './field';
import type { StyleSet } from './style';

export type WidgetGroup =
  | 'identity'
  | 'contact'
  | 'content'
  | 'media'
  | 'business'
  | 'utility';

export type WidgetTier = 'FREE' | 'PRO';

export interface WidgetPart {
  key: string;
  label: string;
  /** Marks a part that only exists for certain design values. */
  visibleIf?: { key: string; equals: unknown };
}

export interface WidgetDeprecation {
  since: string;
  replacedBy?: string;
  note?: string;
}

/**
 * Reference resolution the backend performs before the payload leaves the API,
 * so the renderer stays pure and synchronous.
 */
export interface WidgetReferenceSpec {
  /** Dot path into content, e.g. "profileId" or "items[].productId". */
  path: string;
  entity: 'appointmentProfile' | 'cardLink' | 'product';
  /** Key the resolved object is attached under, e.g. "profile". */
  as: string;
}

export interface WidgetMeta<
  C extends Record<string, unknown> = Record<string, unknown>,
  D extends Record<string, unknown> = Record<string, unknown>,
> {
  type: string;
  label: string;
  /** Lucide icon key, resolved to a component on the client. */
  iconName: string;
  group: WidgetGroup;
  tier?: WidgetTier;
  description?: string;

  /**
   * Breaking-change counter for `content`. Bump ONLY when the shape changes in
   * a way old data can't satisfy; adding an optional field needs no bump.
   */
  contentVersion: number;

  /** Named inner elements the admin can style → `.n<id> .p-<part>`. */
  parts: WidgetPart[];

  /**
   * Starting look, copied onto the node when the widget is placed.
   *
   * The `Render` components emit class names and nothing else — no Tailwind, no
   * inline styles — so a widget with no part styles renders as raw stacked
   * HTML. That is correct for the engine (it's what lets one widget look
   * completely different across templates) but wrong as a STARTING POINT: an
   * admin who drops a Profile and sees unstyled boxes reasonably concludes the
   * builder is broken.
   *
   * So the meta ships a default. It is COPIED, not referenced — once on the
   * node it is ordinary `partStyles` the admin edits or deletes freely, and
   * changing this table later never mutates an existing template.
   */
  defaultPartStyles?: Record<string, StyleSet>;

  /** Design knobs the admin sets; any key can be unlocked via node.userOptions. */
  designSchema: FieldSchema[];

  /** Content the user edits. Generates the entire editor form. */
  contentSchema: FieldSchema[];

  defaultDesign: D;
  defaultContent: C;

  /** Rows the backend must resolve before render. */
  references?: WidgetReferenceSpec[];

  /** True when the widget needs client JS (carousel, map, form, embed). */
  interactive?: boolean;

  /**
   * Content is not stored on the card — it is derived from card data.
   * `CONTACT_LINKS` reads CardLink rows; `PROFILE` reads general info.
   */
  derived?: boolean;

  deprecated?: WidgetDeprecation;
}

/** Any widget meta, for registry-level code that doesn't care about generics. */
export type AnyWidgetMeta = WidgetMeta<Record<string, unknown>, Record<string, unknown>>;

/** Content migrations, keyed by the target contentVersion. Forward-only. */
export type WidgetMigrations = Record<number, (content: any) => any>;

/** Content profiles used by the builder preview and the generic test suite. */
export interface WidgetPreviews {
  empty: Record<string, unknown>;
  typical: Record<string, unknown>;
  stress: Record<string, unknown>;
}

/** What a widget module exports (the React `Render` is added by frontends). */
export interface WidgetModule {
  meta: AnyWidgetMeta;
  migrations?: WidgetMigrations;
  previews?: WidgetPreviews;
}
