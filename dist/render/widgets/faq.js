"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqRender = FaqRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
const NativeCarousel_1 = require("../components/NativeCarousel");
function FaqRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No questions yet" });
    const renderedItems = items.map((item, i) => (
    // <details> gives working accordion behaviour with no client JS,
    // which keeps a text-only card at zero KB of JavaScript.
    (0, jsx_runtime_1.jsxs)("details", { className: cls('item'), open: d.openFirst !== false && i === 0, name: d.singleOpen !== false ? 'faq' : undefined, children: [(0, jsx_runtime_1.jsxs)("summary", { className: cls('question'), "data-marker": d.marker ?? 'chevron', children: [(0, shared_1.str)(item.question), (0, jsx_runtime_1.jsx)("span", { className: cls('chevron'), "aria-hidden": true })] }), (0, jsx_runtime_1.jsx)("div", { className: cls('answer'), children: (0, shared_1.str)(item.answer) })] }, i)));
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), c.useCarousel ? ((0, jsx_runtime_1.jsx)(NativeCarousel_1.NativeCarousel, { cls: cls, items: renderedItems })) : ((0, jsx_runtime_1.jsx)("div", { className: cls('list'), children: renderedItems }))] }));
}
