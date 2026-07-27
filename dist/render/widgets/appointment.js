"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRender = AppointmentRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
/**
 * APPOINTMENT — links into the real booking flow.
 *
 * The profile is resolved by the backend before the payload leaves the API
 * (WidgetMeta.references), so this stays pure and synchronous.
 */
function AppointmentRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const profile = c.profile;
    if (!profile?.slug) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Pick an appointment profile" });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), "data-mode": d.mode ?? 'button', children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), (0, shared_1.str)(c.description) && (0, jsx_runtime_1.jsx)("p", { className: cls('description'), children: (0, shared_1.str)(c.description) }), d.showDuration !== false && profile.duration && ((0, jsx_runtime_1.jsxs)("div", { className: cls('meta'), children: [profile.duration, " min"] })), (0, jsx_runtime_1.jsx)("a", { className: cls('button'), href: `/appt/${profile.slug}`, onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'button' }), children: (0, shared_1.str)(c.buttonLabel) || 'Choose a time' })] }));
}
