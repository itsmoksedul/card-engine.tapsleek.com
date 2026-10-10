import { LINK_CATALOG } from "../catalog/links";
import { DEMO_PREVIEW_ASSETS } from "../content/sample-preview";
import type { Binding, BindingFormat } from "../types/node";

function formatLinkUrl(type: string, value?: string): string {
  if (!value) return "";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("sms:")
  ) {
    return value;
  }
  const lowerType = type?.toLowerCase() || "";
  if (lowerType === "phone" || lowerType === "tel" || lowerType === "sms") {
    return `tel:${value}`;
  }
  if (lowerType === "email" || lowerType === "mailto") {
    return `mailto:${value}`;
  }
  if (lowerType === "whatsapp") {
    return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
  }
  return value.startsWith("/") ? value : `https://${value}`;
}

export function resolveBinding(
  binding: Binding | undefined,
  card: any,
  content: any,
  selfData?: any,
): any {
  if (!binding) return undefined;

  if (binding.source === "card") {
    return resolveCardField(binding.field, card);
  }

  if (binding.source === "widget") {
    const widgetData = content?.[binding.key];
    if (!widgetData) return undefined;
    let result: any = widgetData;
    for (const part of binding.path.split(".")) {
      if (result == null) break;
      result = result[part];
    }
    return result;
  }

  if (binding.source === "self") {
    // When repeating over 'links' for a real card, user's real card.links MUST take priority over demo template links!
    if (binding.path === "links") {
      let activeLinks: any[] = [];
      if (card?.links && Array.isArray(card.links) && card.links.length > 0) {
        activeLinks = card.links.filter((l: any) => l.isVisible !== false);
      } else if (Array.isArray(selfData?.links)) {
        activeLinks = selfData.links;
      } else if (Array.isArray(content?.links)) {
        activeLinks = content.links;
      }

      if (activeLinks.length > 0) {
        const design = content?._design || {};
        if (Array.isArray(design.categories) && design.categories.length > 0) {
          activeLinks = activeLinks.filter((l: any) => design.categories.includes(l.category));
        }
        if (Number(design.max) > 0) {
          activeLinks = activeLinks.slice(0, Number(design.max));
        }
        return activeLinks;
      }
    }

    let result: any = selfData !== undefined ? selfData : content;

    // Resolving properties on an individual link item in selfData
    if (selfData && typeof selfData === "object" && !Array.isArray(selfData)) {
      if (binding.path === "url") {
        const urlVal = selfData.url || selfData.value;
        return formatLinkUrl(selfData.type, urlVal);
      }
      if (binding.path === "icon") {
        if (content?._design?.showIcon === false) return "";
        if (selfData.icon) return selfData.icon;
        const catalogItem = LINK_CATALOG.find((l) => l.type === selfData.type);
        if (catalogItem?.iconName) return catalogItem.iconName;
        return selfData.type || "";
      }
      if (binding.path === "label") {
        if (selfData.label) return selfData.label;
        if (selfData.title) return selfData.title;
        const catalogItem = LINK_CATALOG.find((l) => l.type === selfData.type);
        if (catalogItem?.label) return catalogItem.label;
        return selfData.type || "";
      }
      if (binding.path === "value") {
        if (content?._design?.showValue === false) return "";
        let raw = selfData.value || selfData.url || "";
        if (typeof raw === "string") {
          raw = raw.replace(/^tel:/, '').replace(/^mailto:/, '').replace(/^https:\/\/wa\.me\//, '');
        }
        return raw;
      }
    }

    for (const part of binding.path.split(".")) {
      if (result == null) break;
      result = result[part];
    }

    if (binding.format) {
      return formatValue(binding.format, result, selfData, content?._design);
    }

    if (
      (result == null || (Array.isArray(result) && result.length === 0)) &&
      card
    ) {
      if (binding.path === "links" && (card.links || content?.links)) {
        return card.links && card.links.length > 0
          ? card.links
          : content?.links;
      }
      if (card[binding.path]) {
        return card[binding.path];
      }
    }
    return result;
  }

  if (binding.source === "token") {
    return `var(--${binding.path.replace(".", "-")})`;
  }

  return undefined;
}

const WEEKDAYS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function formatTime(value: unknown, format?: unknown): string {
  if (typeof value !== "string" || !value) return "";
  if (format === "24h") return value;
  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(Number.isFinite(m) ? m : 0).padStart(2, "0")} ${suffix}`;
}

function formatValue(
  format: BindingFormat,
  value: any,
  selfData: any,
  design: any,
): any {
  switch (format) {
    case "weekday":
      return typeof value === "string" ? (WEEKDAYS[value] ?? value) : value;
    case "hoursRange": {
      const row = selfData ?? {};
      if (row.closed) return "Closed";
      const open = formatTime(row.open, design?.timeFormat);
      const close = formatTime(row.close, design?.timeFormat);
      return open && close ? `${open} – ${close}` : open || close || "";
    }
    case "appointmentUrl": {
      // `profile` is resolved by the backend from `profileId` (meta.references).
      const slug = value?.slug;
      return typeof slug === "string" && slug
        ? `/appt/${encodeURIComponent(slug)}`
        : undefined;
    }
    // MAP widget. Each returns "" when switched off or without an address so
    // the node's `hideIfEmpty` removes it.
    case "mapAddress": {
      if (design?.showAddress === false) return "";
      return typeof value === "string" ? value.trim() : "";
    }
    case "mapEmbed": {
      const address = typeof value === "string" ? value.trim() : "";
      if (!address) return "";
      const height = MAP_HEIGHTS[design?.height as string] ?? MAP_HEIGHTS.md;
      const mapType = design?.mapType === "k" ? "k" : "m"; // k=satellite
      const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`;
      // Goes through the "embed" sanitizer, which re-checks the iframe host.
      return `<iframe src="${src}" width="100%" height="${height}" style="border:0;width:100%;height:${height}px;display:block" frameborder="0" loading="lazy" title="Map" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    }
    case "mapDirectionsUrl": {
      if (design?.showDirectionsBtn === false) return "";
      const address = typeof value === "string" ? value.trim() : "";
      return address
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
        : "";
    }
    default:
      return value;
  }
}

const MAP_HEIGHTS: Record<string, string> = { sm: "200", md: "300", lg: "450" };

function getDynamicBase(slug?: string): string {
  if (slug) {
    return `https://${slug}.tapsleek.com`;
  }
  const url =
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_CARD_BASE_URL) ||
    "https://tapsleek.com";
  return String(url).replace(/\/+$/, "");
}

function resolveCardField(field: string, card: any): any {
  if (!card) return undefined;

  const showPlaceholders = Boolean(card.showPlaceholders);
  const hasUserIdentity = Boolean(
    card.firstName ||
      card.lastName ||
      card.name ||
      card.jobTitle ||
      card.companyName ||
      card.profileImage ||
      card.avatar,
  );

  switch (field) {
    // Assembled, not stored.
    case "fullName": {
      const name = [card.firstName, card.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return (
        name ||
        card.name ||
        (showPlaceholders && !hasUserIdentity ? "John Doe" : undefined)
      );
    }
    case "firstName": {
      return (
        card.firstName ||
        (showPlaceholders && !hasUserIdentity ? "John" : undefined)
      );
    }
    case "lastName": {
      return (
        card.lastName ||
        (showPlaceholders && !hasUserIdentity ? "Doe" : undefined)
      );
    }
    case "jobTitle": {
      return (
        card.jobTitle ||
        (showPlaceholders && !hasUserIdentity ? "Job title" : undefined)
      );
    }
    case "companyName":
    case "company": {
      return (
        card.companyName ||
        card.company ||
        (showPlaceholders && !hasUserIdentity ? "Company" : undefined)
      );
    }
    case "location": {
      // Optional user info — never show dummy "Location" placeholder
      return card.location || undefined;
    }
    case "bio": {
      // Optional user text — never show dummy "Bio description..." placeholder
      return card.bio || undefined;
    }
    case "companyLogo":
    case "logo": {
      // Optional logo — never show dummy logo if not uploaded
      return card.companyLogo || card.logo || undefined;
    }
    case "profileImage":
    case "avatar": {
      return (
        card.profileImage ||
        card.avatar ||
        DEMO_PREVIEW_ASSETS.avatar
      );
    }
    case "coverPhoto":
    case "cover": {
      return (
        card.coverPhoto ||
        card.cover ||
        DEMO_PREVIEW_ASSETS.cover
      );
    }

    // Derived from the slug / share key.
    case "publicUrl":
      return card.slug
        ? getDynamicBase(card.slug)
        : showPlaceholders
          ? "https://tapsleek.com/preview"
          : undefined;
    case "shareUrl":
      return card.shareKey
        ? `${getDynamicBase()}/k/${card.shareKey}`
        : showPlaceholders
          ? "https://tapsleek.com/preview"
          : undefined;
    case "vcardUrl":
      return card.slug
        ? `${getDynamicBase(card.slug)}/vcard`
        : showPlaceholders
          ? "#"
          : undefined;
    case "qrUrl":
      return card.slug
        ? `${getDynamicBase(card.slug)}/qr`
        : showPlaceholders
          ? "#"
          : undefined;

    default: {
      const value = card[field];
      // Normalise '' to undefined so `hideIfEmpty` behaves the same whether a
      // field is missing or merely blank.
      return value === "" ? undefined : value;
    }
  }
}
