"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRenderer = CardRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const NodeRenderer_1 = require("./NodeRenderer");
const BlockRenderer_1 = require("./BlockRenderer");
function CardRenderer({ definition, content, card, links, isEditing, gatedWidgetKeys, onTrack, onActionClick, blocks, theme, }) {
    const ctx = {
        card,
        links,
        blocks,
        isEditing,
        gatedWidgetKeys,
        track: onTrack || (() => { }),
        onActionClick,
    };
    // ── User card: render the composed blocks inside the template's root frame ──
    // Only when there ARE blocks. An empty array must fall through to the template
    // design (below) — otherwise a freshly created card, whose `blocks` is `[]`,
    // renders an empty frame instead of the template's Profile/identity widgets.
    if (blocks && blocks.length > 0) {
        const rootId = definition.root.id;
        return ((0, jsx_runtime_1.jsxs)("div", { className: "ts-card", style: themeRootStyle(theme), children: [(0, jsx_runtime_1.jsx)("div", { className: `n${rootId}`, "data-node-id": isEditing ? rootId : undefined, children: blocks
                        .filter((b) => !b.hidden)
                        .map((b) => ((0, jsx_runtime_1.jsx)(BlockRenderer_1.BlockRenderer, { definition: definition, block: b, ctx: ctx }, b.id))) }), definition.popups?.map((popup) => ((0, jsx_runtime_1.jsx)("div", { className: "ts-popup", hidden: true, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: popup.root, content: content, ctx: ctx }) }, popup.key)))] }));
    }
    // ── Template design render (admin preview / public page from the tree) ──
    return ((0, jsx_runtime_1.jsxs)("div", { className: "ts-card", style: themeRootStyle(theme), children: [(0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: definition.root, content: content, ctx: ctx }), definition.popups?.map((popup) => ((0, jsx_runtime_1.jsx)("div", { className: "ts-popup", hidden: true, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: popup.root, content: content, ctx: ctx }) }, popup.key)))] }));
}
/**
 * The two Theme knobs that aren't token overrides: font-weight and layout are
 * applied at the root here (the colour/font/radius/density vars come from
 * `compileCardTheme`, injected by the host in the `ts-override` layer).
 */
function themeRootStyle(theme) {
    if (!theme)
        return undefined;
    const style = {};
    if (typeof theme.fontWeight === 'number')
        style.fontWeight = theme.fontWeight;
    if (theme.layout === 'center')
        style.textAlign = 'center';
    else if (theme.layout === 'left')
        style.textAlign = 'left';
    return Object.keys(style).length ? style : undefined;
}
