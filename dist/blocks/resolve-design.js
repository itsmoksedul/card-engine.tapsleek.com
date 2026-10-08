"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBlockDesign = resolveBlockDesign;
exports.userBlockTypes = userBlockTypes;
exports.blockClass = blockClass;
const card_visibility_1 = require("../render/card-visibility");
const definition_1 = require("../types/definition");
const node_1 = require("../types/node");
const registry_1 = require("../widgets/registry");
/** First widget instance of `type` found in the template tree, if any. */
function templateInstance(def, type) {
    const normTarget = (0, registry_1.normalizeWidgetType)(type).toUpperCase();
    const lowerType = type.toLowerCase();
    for (const root of (0, definition_1.definitionRoots)(def)) {
        let matched = null;
        (0, node_1.walkTreeOrder)(root, (n) => {
            if (matched)
                return;
            if ((0, node_1.isWidget)(n)) {
                const wNorm = (0, registry_1.normalizeWidgetType)(n.widget).toUpperCase();
                const keyLower = (n.key || "").toLowerCase();
                const labelLower = (n.label || "").toLowerCase();
                if (wNorm === normTarget ||
                    n.widget === type ||
                    n.widget?.toUpperCase() === normTarget ||
                    keyLower === lowerType ||
                    labelLower === lowerType) {
                    matched = {
                        design: n.design,
                        partStyles: n.partStyles,
                        layout: n.layout,
                        rootStyle: n.style,
                        rootHidden: n.hidden,
                    };
                }
            }
        });
        if (matched)
            return matched;
    }
    return null;
}
/**
 * Find the first non-core widget in the template tree. This is the generic
 * "placeholder" for user blocks, so its custom outer styles (margin, border, background)
 * should apply as a generic template to any block type the user adds.
 */
function templatePlaceholder(def) {
    for (const root of (0, definition_1.definitionRoots)(def)) {
        let matched = null;
        (0, node_1.walkTreeOrder)(root, (n) => {
            if (matched)
                return;
            if ((0, node_1.isWidget)(n)) {
                if (!(0, card_visibility_1.isCoreWidget)(n.widget)) {
                    matched = {
                        rootStyle: n.style,
                        rootHidden: n.hidden,
                    };
                }
            }
        });
        if (matched)
            return matched;
    }
    return null;
}
/**
 * The `(design, partStyles)` a user block of `type` should render with, given
 * the card's template. Deterministic and pure.
 */
function resolveBlockDesign(def, type) {
    const normType = (type || "").toUpperCase();
    const aliasMap = {
        MAPS: "MAP",
        LOCATION: "MAP",
        MAP: "MAP",
        ABOUT_US: "DESCRIPTION",
        ABOUT: "DESCRIPTION",
        HOURS: "BUSINESS_HOURS",
        REVIEWS: "TESTIMONIALS",
        BUTTON: "CTA_BUTTON",
        SOCIAL_ICON: "SOCIAL_ICONS",
        HR: "DIVIDER",
        SPACE: "SPACER",
        HTML_EMBED: "EMBED",
        VCARD: "VCARD_BUTTON",
        LINKS: "CONTACT_LINKS",
    };
    const targetType = aliasMap[normType] || normType;
    let inst = templateInstance(def, targetType) ?? templateInstance(def, type);
    if (!inst) {
        const placeholder = templatePlaceholder(def);
        if (placeholder) {
            // Fallback to the placeholder's explicitly authored root styles, so generic
            // spacing/borders apply to all user blocks even if they don't match the placeholder's type.
            inst = {
                rootStyle: placeholder.rootStyle,
                rootHidden: placeholder.rootHidden,
            };
        }
    }
    const meta = (0, registry_1.getWidgetMeta)(targetType) ?? (0, registry_1.getWidgetMeta)(type);
    // Part styles: start with meta defaults, but NEVER inject automatic padding/margin onto root
    const partStyles = {};
    if (meta?.defaultPartStyles) {
        for (const [part, set] of Object.entries(meta.defaultPartStyles)) {
            const cloned = structuredClone(set);
            // Strip automatic root padding/margin so admin design rules supreme
            if (part === "root" && cloned.base) {
                delete cloned.base.padding;
                delete cloned.base.margin;
            }
            partStyles[part] = cloned;
        }
    }
    // If a template instance exists from Admin, its authored partStyles take priority
    if (inst?.partStyles) {
        for (const [part, set] of Object.entries(inst.partStyles)) {
            partStyles[part] = {
                ...(partStyles[part] ?? {}),
                ...(set ?? {}),
                base: { ...(partStyles[part]?.base ?? {}), ...(set?.base ?? {}) },
                sm: { ...(partStyles[part]?.sm ?? {}), ...(set?.sm ?? {}) },
                md: { ...(partStyles[part]?.md ?? {}), ...(set?.md ?? {}) },
            };
        }
    }
    // Layout: If the admin authored a custom layout in the template, USE IT DIRECTLY!
    // Do NOT merge defaultLayout over it, which re-injects unwanted default padding/margin/structure.
    const rawLayout = inst?.layout
        ? structuredClone(inst.layout)
        : meta?.defaultLayout
            ? structuredClone(meta.defaultLayout)
            : undefined;
    let layout = rawLayout;
    if (layout) {
        const rootStyle = inst?.rootStyle;
        const rootPartStyle = inst?.partStyles?.root;
        if (rootStyle || rootPartStyle) {
            layout.style = {
                ...(layout.style ?? {}),
                base: {
                    ...(layout.style?.base ?? {}),
                    ...(rootPartStyle?.base ?? {}),
                    ...(rootStyle?.base ?? {}),
                },
                sm: {
                    ...(layout.style?.sm ?? {}),
                    ...(rootPartStyle?.sm ?? {}),
                    ...(rootStyle?.sm ?? {}),
                },
                md: {
                    ...(layout.style?.md ?? {}),
                    ...(rootPartStyle?.md ?? {}),
                    ...(rootStyle?.md ?? {}),
                },
            };
        }
    }
    return {
        design: { ...(meta?.defaultDesign ?? {}), ...(inst?.design ?? {}) },
        partStyles,
        layout,
        hasCustomLayout: Boolean(inst?.layout),
        rootStyle: inst?.rootStyle,
        rootHidden: inst?.rootHidden,
    };
}
/**
 * Every widget type a user may add as a block. Design/decoration + content
 * widgets are user-addable; identity widgets that read card data (`derived`)
 * and the lead form (edited in its own tab) are not.
 */
function userBlockTypes(allTypes) {
    const EXCLUDED = new Set(["LEAD_FORM"]);
    return allTypes
        .filter((m) => !m.derived && !EXCLUDED.has(m.type))
        .map((m) => m.type);
}
/** The CSS class a block wrapper carries so it picks up the template preset. */
function blockClass(type) {
    return `tsb-${String(type).replace(/[^A-Za-z0-9_-]/g, "")}`;
}
