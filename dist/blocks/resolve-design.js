"use strict";
/**
 * resolveBlockDesign — how a user block gets its look (v2.1).
 *
 * A user block stores only content. Its design comes from the card's TEMPLATE:
 *
 *   1. If the template contains a widget of the same type, use that instance's
 *      `design` + `partStyles` — "the template's design pattern for this widget."
 *   2. Otherwise fall back to the widget meta's `defaultDesign` +
 *      `defaultPartStyles`, so a block of a type the template never used still
 *      renders styled rather than raw.
 *
 * Framework-free: shared by the compiler (emits the preset CSS) and the renderer
 * (applies the preset design), so the two can never disagree.
 */
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
    const inst = templateInstance(def, type);
    const meta = (0, registry_1.getWidgetMeta)(type);
    return {
        design: { ...(meta?.defaultDesign ?? {}), ...(inst?.design ?? {}) },
        partStyles: inst?.partStyles ?? meta?.defaultPartStyles ?? {},
        layout: inst?.layout ?? meta?.defaultLayout,
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
