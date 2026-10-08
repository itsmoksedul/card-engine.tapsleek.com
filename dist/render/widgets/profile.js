"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRender = ProfileRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const sample_preview_1 = require("../../content/sample-preview");
const shared_1 = require("./shared");
function ProfileRender({ design, cls, ctx }) {
    const card = ctx.card ?? {};
    const d = (design ?? {});
    const showPlaceholders = Boolean(card.showPlaceholders);
    const hasUserIdentity = Boolean(card.firstName ||
        card.lastName ||
        card.name ||
        card.jobTitle ||
        card.companyName ||
        card.profileImage ||
        card.avatar);
    const name = (0, shared_1.displayName)(card);
    const subtitle = (0, shared_1.subtitleOf)(card);
    const cover = card.coverPhoto ||
        (showPlaceholders && !hasUserIdentity ? sample_preview_1.DEMO_PREVIEW_ASSETS.cover : undefined);
    const avatar = card.profileImage ||
        (showPlaceholders && !hasUserIdentity ? sample_preview_1.DEMO_PREVIEW_ASSETS.avatar : undefined);
    const logo = card.companyLogo;
    const location = card.location;
    const bio = card.bio;
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), "data-align": d.align ?? 'center', children: [d.showCover !== false && cover && ((0, jsx_runtime_1.jsx)("img", { className: cls('cover'), src: cover, alt: "", loading: "lazy" })), d.showAvatar !== false && avatar && ((0, jsx_runtime_1.jsx)("img", { className: cls('avatar'), src: avatar, alt: name || 'Avatar', loading: "lazy" })), d.showLogo !== false && logo && ((0, jsx_runtime_1.jsx)("img", { className: cls('logo'), src: logo, alt: card.companyName ?? '', loading: "lazy" })), name && (0, jsx_runtime_1.jsx)("div", { className: cls('name'), children: name }), subtitle && (0, jsx_runtime_1.jsx)("div", { className: cls('subtitle'), children: subtitle }), d.showLocation !== false && location && ((0, jsx_runtime_1.jsx)("div", { className: cls('location'), children: location })), d.showBio !== false && bio && (0, jsx_runtime_1.jsx)("p", { className: cls('bio'), children: bio })] }));
}
