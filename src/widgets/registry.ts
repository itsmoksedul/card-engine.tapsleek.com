/**
 * Widget registry — the one file that grows when you add a widget.
 *
 * Everything else derives from here:
 *   • the builder palette            (`manifest()` → GET /admin/widgets)
 *   • content validation             (`schemaToZod(meta.contentSchema)`)
 *   • publish-time template linting
 *   • lazy content migration         (`migrations`)
 *   • the generic widget test suite   (`previews`)
 *
 * A widget type is NEVER removed — a template somewhere still references it.
 * Retire one with `meta.deprecated` instead: hidden from the palette, still
 * renders, flagged as a warning on publish.
 */

import type { AnyWidgetMeta, WidgetMigrations, WidgetPreviews } from '../types/widget';

import * as Appointment from './appointment';
import * as BusinessHours from './business-hours';
import * as ContactLinks from './contact-links';
import * as CtaButton from './cta-button';
import * as Faq from './faq';
import * as Gallery from './gallery';
import * as LeadForm from './lead-form';
import * as Profile from './profile';
import * as RichText from './rich-text';
import * as ServiceList from './service-list';
import * as Testimonials from './testimonials';

export interface RegisteredWidget {
  meta: AnyWidgetMeta;
  migrations?: WidgetMigrations;
  previews?: WidgetPreviews;
}

const MODULES: RegisteredWidget[] = [
  Profile,
  ContactLinks,
  RichText,
  ServiceList,
  Gallery,
  Faq,
  Testimonials,
  BusinessHours,
  Appointment,
  LeadForm,
  CtaButton,
] as RegisteredWidget[];

const BY_TYPE = new Map<string, RegisteredWidget>(MODULES.map((m) => [m.meta.type, m]));

/** Every registered type, in palette order. */
export const WIDGET_TYPES: string[] = MODULES.map((m) => m.meta.type);

export function getWidget(type: string): RegisteredWidget | undefined {
  return BY_TYPE.get(type);
}

export function getWidgetMeta(type: string): AnyWidgetMeta | undefined {
  return BY_TYPE.get(type)?.meta;
}

export function hasWidget(type: string): boolean {
  return BY_TYPE.has(type);
}

/**
 * JSON-safe descriptor list. This is what the builder palette renders and what
 * the backend validates against — one source of truth, so the two cannot drift.
 */
export function manifest(): AnyWidgetMeta[] {
  return MODULES.map((m) => m.meta);
}

/** Palette listing: deprecated widgets are hidden from new placements. */
export function paletteManifest(): AnyWidgetMeta[] {
  return manifest().filter((m) => !m.deprecated);
}

/** Widget types that need client JS — used to keep static cards JS-free. */
export function interactiveTypes(): string[] {
  return manifest()
    .filter((m) => m.interactive)
    .map((m) => m.type);
}

/** Widgets whose content is derived from card data rather than stored. */
export function derivedTypes(): string[] {
  return manifest()
    .filter((m) => m.derived)
    .map((m) => m.type);
}

/** Every part key a widget declares — used to reject dead `partStyles`. */
export function partKeys(type: string): string[] {
  return getWidgetMeta(type)?.parts.map((p) => p.key) ?? [];
}
