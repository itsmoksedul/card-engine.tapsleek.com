"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialIconsRender = SocialIconsRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
/**
 * SOCIAL_ICONS — explicitly defined social media profile links.
 * Click analytics are automatically captured by CardAnalytics via `data-widget="SOCIAL_ICONS"`.
 */
function SocialIconsRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const profiles = (0, shared_1.asArray)(c.profiles);
    if (!profiles.length) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No social profiles" });
    }
    // Handle alignment
    const justifyContent = d.layout === 'center' ? 'center' : d.layout === 'grid' ? 'space-between' : 'flex-start';
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-layout": d.layout ?? 'center', "data-size": d.size ?? 'md', children: (0, jsx_runtime_1.jsx)("div", { className: cls('list'), style: { justifyContent }, children: profiles.map((profile, i) => ((0, jsx_runtime_1.jsx)("a", { className: cls('item'), href: profile.url || '#', target: "_blank", rel: "noreferrer", "aria-label": profile.platform, children: (0, jsx_runtime_1.jsx)("span", { className: cls('icon'), "data-icon": profile.platform, "aria-hidden": true }) }, i))) }) }));
}
