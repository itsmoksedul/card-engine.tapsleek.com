"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRenderer = CardRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const NodeRenderer_1 = require("./NodeRenderer");
function CardRenderer({ definition, content, card, links, isEditing, onTrack }) {
    const ctx = {
        card,
        links,
        isEditing,
        track: onTrack || (() => { }),
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "ts-card", children: [(0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: definition.root, content: content, ctx: ctx }), definition.popups?.map(popup => ((0, jsx_runtime_1.jsx)("div", { className: "ts-popup", hidden: true, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: popup.root, content: content, ctx: ctx }) }, popup.id)))] }));
}
