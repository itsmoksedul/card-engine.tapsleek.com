"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBinding = resolveBinding;
const links_1 = require("../catalog/links");
function formatLinkUrl(type, value) {
    if (!value)
        return "";
    if (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("mailto:") ||
        value.startsWith("tel:") ||
        value.startsWith("sms:")) {
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
function resolveBinding(binding, card, content, selfData) {
    if (!binding)
        return undefined;
    if (binding.source === "card") {
        return resolveCardField(binding.field, card);
    }
    if (binding.source === "widget") {
        const widgetData = content?.[binding.key];
        if (!widgetData)
            return undefined;
        let result = widgetData;
        for (const part of binding.path.split(".")) {
            if (result == null)
                break;
            result = result[part];
        }
        return result;
    }
    if (binding.source === "self") {
        // When repeating over 'links' for a real card, user's real card.links MUST take priority over demo template links!
        if (binding.path === "links") {
            let activeLinks = [];
            if (card?.links && Array.isArray(card.links) && card.links.length > 0) {
                activeLinks = card.links.filter((l) => l.isVisible !== false);
            }
            else if (Array.isArray(selfData?.links)) {
                activeLinks = selfData.links;
            }
            else if (Array.isArray(content?.links)) {
                activeLinks = content.links;
            }
            if (activeLinks.length > 0) {
                const design = content?._design || {};
                if (Array.isArray(design.categories) && design.categories.length > 0) {
                    activeLinks = activeLinks.filter((l) => design.categories.includes(l.category));
                }
                if (Number(design.max) > 0) {
                    activeLinks = activeLinks.slice(0, Number(design.max));
                }
                return activeLinks;
            }
        }
        let result = selfData !== undefined ? selfData : content;
        // Resolving properties on an individual link item in selfData
        if (selfData && typeof selfData === "object" && !Array.isArray(selfData)) {
            if (binding.path === "url") {
                const urlVal = selfData.url || selfData.value;
                return formatLinkUrl(selfData.type, urlVal);
            }
            if (binding.path === "icon") {
                if (content?._design?.showIcon === false)
                    return "";
                if (selfData.icon)
                    return selfData.icon;
                const catalogItem = links_1.LINK_CATALOG.find((l) => l.type === selfData.type);
                if (catalogItem?.iconName)
                    return catalogItem.iconName;
                return selfData.type || "";
            }
            if (binding.path === "label") {
                if (selfData.label)
                    return selfData.label;
                if (selfData.title)
                    return selfData.title;
                const catalogItem = links_1.LINK_CATALOG.find((l) => l.type === selfData.type);
                if (catalogItem?.label)
                    return catalogItem.label;
                return selfData.type || "";
            }
            if (binding.path === "value") {
                if (content?._design?.showValue === false)
                    return "";
                let raw = selfData.value || selfData.url || "";
                if (typeof raw === "string") {
                    raw = raw.replace(/^tel:/, '').replace(/^mailto:/, '').replace(/^https:\/\/wa\.me\//, '');
                }
                return raw;
            }
        }
        for (const part of binding.path.split(".")) {
            if (result == null)
                break;
            result = result[part];
        }
        if (binding.format) {
            return formatValue(binding.format, result, selfData, content?._design);
        }
        if ((result == null || (Array.isArray(result) && result.length === 0)) &&
            card) {
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
const WEEKDAYS = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
};
function formatTime(value, format) {
    if (typeof value !== "string" || !value)
        return "";
    if (format === "24h")
        return value;
    const [h, m] = value.split(":").map(Number);
    if (!Number.isFinite(h))
        return value;
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(Number.isFinite(m) ? m : 0).padStart(2, "0")} ${suffix}`;
}
function formatValue(format, value, selfData, design) {
    switch (format) {
        case "weekday":
            return typeof value === "string" ? (WEEKDAYS[value] ?? value) : value;
        case "hoursRange": {
            const row = selfData ?? {};
            if (row.closed)
                return "Closed";
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
        default:
            return value;
    }
}
function base() {
    const url = (typeof process !== "undefined" &&
        process.env?.NEXT_PUBLIC_CARD_BASE_URL) ||
        "https://tapsleek.me";
    return String(url).replace(/\/+$/, "");
}
function resolveCardField(field, card) {
    if (!card)
        return undefined;
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
