import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState, str } from './shared';
const DAY_LABELS = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_INDEX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export function BusinessHoursRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const days = asArray(c.days);
    if (!days.length)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No hours set" });
    // Computed on the client only. Doing this during SSR would bake one
    // visitor's "today" into the ISR-cached HTML for everyone.
    const today = typeof window === 'undefined' ? null : DAY_INDEX[new Date().getDay()];
    return (_jsxs("div", { className: cls('root'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), _jsx("div", { className: cls('list'), children: days.map((day) => {
                    const key = str(day.day);
                    const closed = Boolean(day.closed);
                    return (_jsxs("div", { className: cls('row'), "data-today": d.highlightToday !== false && today === key ? 'true' : undefined, "data-closed": closed ? 'true' : undefined, children: [_jsx("span", { className: cls('day'), children: DAY_LABELS[key] ?? key }), _jsx("span", { className: cls('time'), children: closed
                                    ? 'Closed'
                                    : `${formatTime(str(day.open), d.timeFormat)} – ${formatTime(str(day.close), d.timeFormat)}` })] }, key));
                }) }), str(c.note) && _jsx("p", { className: cls('note'), children: str(c.note) })] }));
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
