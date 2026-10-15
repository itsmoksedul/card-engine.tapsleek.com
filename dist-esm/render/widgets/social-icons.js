import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RenderIcon } from './icon-helper';
import { asArray, EmptyState, navProps } from './shared';
/**
 * SOCIAL_ICONS — explicitly defined social media profile links.
 * Click analytics are automatically captured by CardAnalytics via `data-widget="SOCIAL_ICONS"`.
 */
export function SocialIconsRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const demoProfiles = asArray(c.profiles);
    const profiles = demoProfiles.length ? demoProfiles : asArray(ctx.card?.socials || ctx.card?.socialLinks);
    if (!profiles.length) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No social profiles" });
    }
    // Handle alignment
    const justifyContent = d.layout === 'center' ? 'center' : d.layout === 'grid' ? 'space-between' : 'flex-start';
    return (_jsx("div", { className: cls('root'), "data-layout": d.layout ?? 'center', "data-size": d.size ?? 'md', children: _jsx("div", { className: cls('list'), style: { justifyContent }, children: profiles.map((profile, i) => (_jsxs("a", { className: cls('item'), ...navProps(profile.url, ctx.isEditing ?? false, '_blank'), "aria-label": profile.platform, children: [_jsx(RenderIcon, { name: profile.platform, className: cls('icon') }), d.showLabel !== false && (_jsx("span", { className: cls('label'), children: profile.platform }))] }, i))) }) }));
}
