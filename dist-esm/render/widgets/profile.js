import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DEMO_PREVIEW_ASSETS } from '../../content/sample-preview';
import { displayName, subtitleOf, imgSize } from './shared';
export function ProfileRender({ design, cls, ctx }) {
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
    const name = displayName(card);
    const subtitle = subtitleOf(card);
    const cover = card.coverPhoto ||
        card.cover ||
        d.coverPhoto ||
        d.cover ||
        (showPlaceholders && !hasUserIdentity ? DEMO_PREVIEW_ASSETS.cover : undefined);
    const avatar = card.profileImage ||
        card.avatar ||
        d.profileImage ||
        d.avatar ||
        (showPlaceholders && !hasUserIdentity ? DEMO_PREVIEW_ASSETS.avatar : undefined);
    const logo = card.companyLogo;
    const location = card.location;
    const bio = card.bio;
    return (_jsxs("div", { className: cls('root'), "data-align": d.align ?? 'center', children: [d.showCover !== false && cover && (_jsx("img", { className: cls('cover'), src: cover, ...imgSize(card, cover), alt: "", loading: "lazy" })), d.showAvatar !== false && avatar && (_jsx("img", { className: cls('avatar'), src: avatar, ...imgSize(card, avatar), alt: name || 'Avatar', loading: "lazy" })), d.showLogo !== false && logo && (_jsx("img", { className: cls('logo'), src: logo, ...imgSize(card, logo), alt: card.companyName ?? '', loading: "lazy" })), name && _jsx("div", { className: cls('name'), children: name }), subtitle && _jsx("div", { className: cls('subtitle'), children: subtitle }), d.showLocation !== false && location && (_jsx("div", { className: cls('location'), children: location })), d.showBio !== false && bio && _jsx("p", { className: cls('bio'), children: bio })] }));
}
