import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EmptyState, str } from './shared';
/**
 * APPOINTMENT — links into the real booking flow.
 *
 * The profile is resolved by the backend before the payload leaves the API
 * (WidgetMeta.references), so this stays pure and synchronous.
 */
export function AppointmentRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const profile = c.profile;
    if (!profile?.slug) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Pick an appointment profile" });
    }
    return (_jsxs("div", { className: cls('root'), "data-mode": d.mode ?? 'button', children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), str(c.description) && _jsx("p", { className: cls('description'), children: str(c.description) }), d.showDuration !== false && profile.duration && (_jsxs("div", { className: cls('meta'), children: [profile.duration, " min"] })), _jsx("a", { className: cls('button'), href: `/appt/${profile.slug}`, onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'button' }), children: str(c.buttonLabel) || 'Choose a time' })] }));
}
