"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsRender = TestimonialsRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function TestimonialsRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No testimonials yet" });
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), (0, jsx_runtime_1.jsx)("div", { className: cls('list'), "data-layout": d.layout ?? 'stack', children: items.map((item, i) => {
                    const rating = Number(item.rating);
                    return ((0, jsx_runtime_1.jsxs)("figure", { className: cls('item'), children: [d.quoteMark && d.quoteMark !== 'none' && ((0, jsx_runtime_1.jsx)("span", { className: cls('mark'), "data-size": d.quoteMark, "aria-hidden": true })), (0, jsx_runtime_1.jsx)("blockquote", { className: cls('quote'), children: (0, shared_1.str)(item.quote) }), d.showRating !== false && Number.isFinite(rating) && rating > 0 && ((0, jsx_runtime_1.jsx)("div", { className: cls('stars'), "aria-label": `${rating} out of 5`, children: Array.from({ length: 5 }, (_, s) => ((0, jsx_runtime_1.jsx)("span", { "data-filled": s < rating, "aria-hidden": true }, s))) })), (0, jsx_runtime_1.jsxs)("figcaption", { className: cls('caption'), children: [d.showAvatar !== false && (0, shared_1.str)(item.avatar) && ((0, jsx_runtime_1.jsx)("img", { className: cls('avatar'), src: (0, shared_1.str)(item.avatar), alt: "", loading: "lazy" })), (0, jsx_runtime_1.jsx)("span", { className: cls('author'), children: (0, shared_1.str)(item.author) }), (0, shared_1.str)(item.role) && (0, jsx_runtime_1.jsx)("span", { className: cls('role'), children: (0, shared_1.str)(item.role) })] })] }, i));
                }) })] }));
}
