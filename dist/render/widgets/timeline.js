"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineRender = TimelineRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function TimelineRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No timeline events" });
    }
    const bulletStyle = d.bulletStyle === 'circle' ? 'circle' : 'dot';
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [c.heading && (0, jsx_runtime_1.jsx)("h3", { className: cls('heading'), children: c.heading }), (0, jsx_runtime_1.jsx)("div", { className: cls('list'), children: items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: cls('item'), children: [(0, jsx_runtime_1.jsx)("div", { className: cls('bullet'), style: bulletStyle === 'circle' ? { background: 'transparent', border: '2px solid var(--tw-border-color, currentColor)' } : undefined }), i < items.length - 1 && (0, jsx_runtime_1.jsx)("div", { className: cls('line') }), (0, jsx_runtime_1.jsxs)("div", { className: cls('content'), children: [item.date && (0, jsx_runtime_1.jsx)("div", { className: cls('date'), children: item.date }), item.title && (0, jsx_runtime_1.jsx)("div", { className: cls('title'), children: item.title }), item.description && (0, jsx_runtime_1.jsx)("div", { className: cls('description'), children: item.description })] })] }, i))) })] }));
}
