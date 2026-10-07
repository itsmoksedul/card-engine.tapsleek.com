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

import type {
  AnyWidgetMeta,
  WidgetMigrations,
  WidgetPreviews,
} from "../types/widget";

import * as Appointment from "./appointment";
import * as BusinessHours from "./business-hours";
import * as ConnectButtons from "./connect-buttons";
import * as ContactLinks from "./contact-links";
import * as Copyright from "./copyright";
import * as CtaButton from "./cta-button";
import * as Description from "./description";
import * as Divider from "./divider";
import * as Embed from "./embed";
import * as Faq from "./faq";
import * as FeatureGrid from "./feature-grid";
import * as Gallery from "./gallery";
import * as Icon from "./icon";
import * as IconBox from "./icon-box";
import * as ImageWidget from "./image";
import * as LeadForm from "./lead-form";
import * as LogoWall from "./logo-wall";
import * as MapWidget from "./map";
import * as PriceList from "./price-list";
import * as Profile from "./profile";
import * as QrCode from "./qr-code";
import * as RichText from "./rich-text";
import * as ServiceList from "./service-list";
import * as ShareButton from "./share-button";
import * as SocialIcons from "./social-icons";
import * as Spacer from "./spacer";
import * as Stats from "./stats";
import * as Team from "./team";
import * as Testimonials from "./testimonials";
import * as Timeline from "./timeline";
import * as Title from "./title";
import * as VcardButton from "./vcard-button";
import * as Video from "./video";
import * as VideoGallery from "./video-gallery";

export interface RegisteredWidget {
  meta: AnyWidgetMeta;
  migrations?: WidgetMigrations;
  previews?: WidgetPreviews;
}

const MODULES: RegisteredWidget[] = [
  Profile,
  ConnectButtons,
  ContactLinks,
  LeadForm,
  Copyright,
  Title,
  Description,
  RichText,
  ImageWidget,
  IconBox,
  ServiceList,
  Gallery,
  Faq,
  Testimonials,
  BusinessHours,
  Appointment,
  CtaButton,
  Icon,
  SocialIcons,
  Video,
  VideoGallery,
  Embed,
  MapWidget,
  Stats,
  Timeline,
  PriceList,
  Team,
  Spacer,
  Divider,
  QrCode,
  VcardButton,
  ShareButton,
  LogoWall,
  FeatureGrid,
] as RegisteredWidget[];

const BY_TYPE = new Map<string, RegisteredWidget>(
  MODULES.map((m) => [m.meta.type, m]),
);

/** Every registered type, in palette order. */
export const WIDGET_TYPES: string[] = MODULES.map((m) => m.meta.type);

export const WIDGET_ALIASES: Record<string, string> = {
  MAPS: 'MAP',
  HOURS: 'BUSINESS_HOURS',
  REVIEWS: 'TESTIMONIALS',
  BUTTON: 'CTA_BUTTON',
  SOCIAL_ICON: 'SOCIAL_ICONS',
  HR: 'DIVIDER',
  SPACE: 'SPACER',
  HTML_EMBED: 'EMBED',
  VCARD: 'VCARD_BUTTON',
  LINKS: 'CONTACT_LINKS',
};

export function normalizeWidgetType(type: string): string {
  const upper = (type || '').toUpperCase();
  return WIDGET_ALIASES[upper] || upper;
}

export function getWidget(type: string): RegisteredWidget | undefined {
  const norm = normalizeWidgetType(type);
  return BY_TYPE.get(norm) ?? BY_TYPE.get(type);
}

export function getWidgetMeta(type: string): AnyWidgetMeta | undefined {
  const norm = normalizeWidgetType(type);
  return BY_TYPE.get(norm)?.meta ?? BY_TYPE.get(type)?.meta;
}

export function hasWidget(type: string): boolean {
  const norm = normalizeWidgetType(type);
  return BY_TYPE.has(norm) || BY_TYPE.has(type);
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
  return getWidgetMeta(type)?.parts?.map((p) => p.key) ?? [];
}
