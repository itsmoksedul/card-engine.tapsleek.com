"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessHoursRender = BusinessHoursRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
const DAY_LABELS = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_INDEX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function BusinessHoursRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const days = (0, shared_1.asArray)(c.days);
    if (!days.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No hours set" });
    // Computed on the client only. Doing this during SSR would bake one
    // visitor's "today" into the ISR-cached HTML for everyone.
    const today = typeof window === 'undefined' ? null : DAY_INDEX[new Date().getDay()];
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), (0, jsx_runtime_1.jsx)("div", { className: cls('list'), children: days.map((day) => {
                    const key = (0, shared_1.str)(day.day);
                    const closed = Boolean(day.closed);
                    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('row'), "data-today": d.highlightToday !== false && today === key ? 'true' : undefined, "data-closed": closed ? 'true' : undefined, children: [(0, jsx_runtime_1.jsx)("span", { className: cls('day'), children: DAY_LABELS[key] ?? key }), (0, jsx_runtime_1.jsx)("span", { className: cls('time'), children: closed
                                    ? 'Closed'
                                    : `${formatTime((0, shared_1.str)(day.open), d.timeFormat)} – ${formatTime((0, shared_1.str)(day.close), d.timeFormat)}` })] }, key));
                }) }), (0, shared_1.str)(c.note) && (0, jsx_runtime_1.jsx)("p", { className: cls('note'), children: (0, shared_1.str)(c.note) })] }));
}
function formatTime(value, format) {
    if (!value)
        return '';
    if (format === '24h')
        return value;
    const [h, m] = value.split(':').map(Number);
    if (!Number.isFinite(h))
        return value;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`;
}
