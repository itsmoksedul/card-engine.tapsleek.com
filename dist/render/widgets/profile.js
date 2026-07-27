"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRender = ProfileRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
/**
 * PROFILE — the card's identity header.
 *
 * Derived: it stores nothing of its own and reads General Info straight off the
 * card. Every field the `Card` model exposes is represented here, so an admin
 * can switch pieces on and off without needing a second widget:
 *
 *   coverPhoto   → cover      firstName+lastName → name
 *   profileImage → avatar     jobTitle+companyName → subtitle
 *   companyLogo  → logo       bio → bio        location → location
 *
 * `actions` wires the native card behaviours (Save contact / Share / QR),
 * which is what replaced the hardcoded "SAVE AS CONTACT" button in v1.
 */
function ProfileRender({ design, cls, ctx }) {
    const card = ctx.card ?? {};
    const d = (design ?? {});
    const name = (0, shared_1.displayName)(card);
    const subtitle = (0, shared_1.subtitleOf)(card);
    const actions = Array.isArray(d.actions) ? d.actions : [];
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), "data-align": d.align ?? 'center', children: [d.showCover !== false && card.coverPhoto && ((0, jsx_runtime_1.jsx)("img", { className: cls('cover'), src: card.coverPhoto, alt: "", loading: "lazy" })), d.showAvatar !== false && card.profileImage && ((0, jsx_runtime_1.jsx)("img", { className: cls('avatar'), src: card.profileImage, alt: name, loading: "lazy" })), d.showLogo !== false && card.companyLogo && ((0, jsx_runtime_1.jsx)("img", { className: cls('logo'), src: card.companyLogo, alt: card.companyName ?? '', loading: "lazy" })), name && (0, jsx_runtime_1.jsx)("div", { className: cls('name'), children: name }), subtitle && (0, jsx_runtime_1.jsx)("div", { className: cls('subtitle'), children: subtitle }), d.showBio !== false && card.bio && (0, jsx_runtime_1.jsx)("p", { className: cls('bio'), children: card.bio }), d.showLocation && card.location && (0, jsx_runtime_1.jsx)("div", { className: cls('location'), children: card.location }), actions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: cls('actions'), children: actions.map((action) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: cls('action'), "data-action": action, onClick: () => ctx.track({ type: 'ACTION', action }), children: ACTION_LABELS[action] ?? action }, action))) }))] }));
}
const ACTION_LABELS = {
    vcard: 'Save contact',
    share: 'Share',
    qr: 'QR code',
};
