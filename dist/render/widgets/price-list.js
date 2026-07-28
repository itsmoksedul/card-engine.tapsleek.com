"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceListRender = PriceListRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function PriceListRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No price list items" });
    }
    const showDots = d.showDots !== false;
    const showDividers = d.showDividers === true;
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [c.heading && (0, jsx_runtime_1.jsx)("h3", { className: cls('heading'), children: c.heading }), (0, jsx_runtime_1.jsx)("div", { className: cls('list'), children: items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: cls('item'), style: showDividers && i < items.length - 1 ? { borderBottom: '1px solid var(--tw-border-color)', paddingBottom: '12px' } : undefined, children: [(0, jsx_runtime_1.jsxs)("div", { className: cls('titleRow'), children: [(0, jsx_runtime_1.jsx)("div", { className: cls('title'), children: item.title }), showDots && (0, jsx_runtime_1.jsx)("div", { className: cls('dots') }), !showDots && (0, jsx_runtime_1.jsx)("div", { style: { flex: 1 } }), item.price && (0, jsx_runtime_1.jsx)("div", { className: cls('price'), children: item.price })] }), item.description && (0, jsx_runtime_1.jsx)("div", { className: cls('description'), children: item.description })] }, i))) })] }));
}
