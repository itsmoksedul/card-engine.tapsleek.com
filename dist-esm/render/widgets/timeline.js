import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState } from './shared';
export function TimelineRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = asArray(c.items);
    if (!items.length) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No timeline events" });
    }
    const bulletStyle = d.bulletStyle === 'circle' ? 'circle' : 'dot';
    return (_jsxs("div", { className: cls('root'), children: [c.heading && _jsx("h3", { className: cls('heading'), children: c.heading }), _jsx("div", { className: cls('list'), children: items.map((item, i) => (_jsxs("div", { className: cls('item'), children: [_jsx("div", { className: cls('bullet'), style: bulletStyle === 'circle' ? { background: 'transparent', border: '2px solid var(--tw-border-color, currentColor)' } : undefined }), i < items.length - 1 && _jsx("div", { className: cls('line') }), _jsxs("div", { className: cls('content'), children: [item.date && _jsx("div", { className: cls('date'), children: item.date }), item.title && _jsx("div", { className: cls('title'), children: item.title }), item.description && _jsx("div", { className: cls('description'), children: item.description })] })] }, i))) })] }));
}
