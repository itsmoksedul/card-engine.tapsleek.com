"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBlockDesign = resolveBlockDesign;
exports.userBlockTypes = userBlockTypes;
exports.blockClass = blockClass;
const definition_1 = require("../types/definition");
const node_1 = require("../types/node");
const registry_1 = require("../widgets/registry");
/** First widget instance of `type` found in the template tree, if any. */
function templateInstance(def, type) {
    for (const root of (0, definition_1.definitionRoots)(def)) {
        const matches = [];
        (0, node_1.walkTreeOrder)(root, (n) => {
            if ((0, node_1.isWidget)(n) && n.widget === type) {
                matches.push({ design: n.design, partStyles: n.partStyles, layout: n.layout, rootStyle: n.style, rootHidden: n.hidden });
            }
        });
        if (matches.length)
            return matches[0];
    }
    return null;
}
/**
 * The `(design, partStyles)` a user block of `type` should render with, given
 * the card's template. Deterministic and pure.
 */
function resolveBlockDesign(def, type) {
    const normType = (type || '').toUpperCase();
    const aliasMap = {
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
    const targetType = aliasMap[normType] || normType;
    const inst = templateInstance(def, targetType) ?? templateInstance(def, type);
    const meta = (0, registry_1.getWidgetMeta)(targetType) ?? (0, registry_1.getWidgetMeta)(type);
    // Deep-merge partStyles so parts omitted in template instances retain their widget defaults
    const partStyles = { ...(meta?.defaultPartStyles ?? {}) };
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
    return {
        design: { ...(meta?.defaultDesign ?? {}), ...(inst?.design ?? {}) },
        partStyles,
        layout: inst?.layout ?? meta?.defaultLayout,
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
    const EXCLUDED = new Set(['LEAD_FORM']);
    return allTypes.filter((m) => !m.derived && !EXCLUDED.has(m.type)).map((m) => m.type);
}
/** The CSS class a block wrapper carries so it picks up the template preset. */
function blockClass(type) {
    return `tsb-${String(type).replace(/[^A-Za-z0-9_-]/g, '')}`;
}
