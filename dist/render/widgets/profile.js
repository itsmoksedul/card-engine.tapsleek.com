"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRender = ProfileRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function ProfileRender({ design, cls, ctx }) {
    const card = ctx.card ?? {};
    const d = (design ?? {});
    const name = (0, shared_1.displayName)(card);
    const subtitle = (0, shared_1.subtitleOf)(card);
    const actions = Array.isArray(d.actions) ? d.actions : [];
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), "data-align": d.align ?? 'center', children: [d.showCover !== false && card.coverPhoto && ((0, jsx_runtime_1.jsx)("img", { className: cls('cover'), src: card.coverPhoto, alt: "", loading: "lazy" })), d.showAvatar !== false && card.profileImage && ((0, jsx_runtime_1.jsx)("img", { className: cls('avatar'), src: card.profileImage, alt: name, loading: "lazy" })), d.showLogo !== false && card.companyLogo && ((0, jsx_runtime_1.jsx)("img", { className: cls('logo'), src: card.companyLogo, alt: card.companyName ?? '', loading: "lazy" })), name && (0, jsx_runtime_1.jsx)("div", { className: cls('name'), children: name }), subtitle && (0, jsx_runtime_1.jsx)("div", { className: cls('subtitle'), children: subtitle }), d.showBio !== false && card.bio && (0, jsx_runtime_1.jsx)("p", { className: cls('bio'), children: card.bio }), d.showLocation && card.location && (0, jsx_runtime_1.jsx)("div", { className: cls('location'), children: card.location })] }));
}
