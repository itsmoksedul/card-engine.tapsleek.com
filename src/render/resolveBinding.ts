import { LINK_CATALOG } from "../catalog/links";
import type { Binding } from "../types/node";

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
    if (binding.path === "links" && card?.links && Array.isArray(card.links)) {
      const activeLinks = card.links.filter((l: any) => l.isVisible !== false);
      if (activeLinks.length > 0) {
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
      }
      if (binding.path === "label") {
        if (selfData.label) return selfData.label;
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

function base(): string {
  const url =
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_CARD_BASE_URL) ||
    "https://tapsleek.me";
  return String(url).replace(/\/+$/, "");
}

function resolveCardField(field: string, card: any): any {
  if (!card) return undefined;

  switch (field) {
    // Assembled, not stored.
    case "fullName": {
      const name = [card.firstName, card.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return name || card.name || undefined;
    }

    // Derived from the slug / share key.
    case "publicUrl":
      return card.slug ? `${base()}/${card.slug}` : undefined;
    case "shareUrl":
      return card.shareKey ? `${base()}/k/${card.shareKey}` : undefined;
    case "vcardUrl":
      return card.slug ? `${base()}/${card.slug}/vcard` : undefined;
    case "qrUrl":
      return card.slug ? `${base()}/${card.slug}/qr` : undefined;

    default: {
      const value = card[field];
      // Normalise '' to undefined so `hideIfEmpty` behaves the same whether a
      // field is missing or merely blank.
      return value === "" ? undefined : value;
    }
  }
}
