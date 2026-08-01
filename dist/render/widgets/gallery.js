"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryRender = GalleryRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
const NativeCarousel_1 = require("../components/NativeCarousel");
function GalleryRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No images yet" });
    const layout = d.layout ?? 'grid-2';
    const renderedItems = items.map((item, i) => ((0, jsx_runtime_1.jsxs)("figure", { className: cls('item'), children: [(0, jsx_runtime_1.jsx)("img", { className: cls('image'), src: (0, shared_1.str)(item.url), alt: (0, shared_1.str)(item.caption), loading: "lazy", style: d.ratio && d.ratio !== 'auto' ? { aspectRatio: d.ratio } : undefined }), d.showCaption && (0, shared_1.str)(item.caption) && ((0, jsx_runtime_1.jsx)("figcaption", { className: cls('caption'), children: (0, shared_1.str)(item.caption) }))] }, i)));
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), c.useCarousel ? ((0, jsx_runtime_1.jsx)(NativeCarousel_1.NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : ((0, jsx_runtime_1.jsx)("div", { className: cls('list'), "data-layout": layout, children: renderedItems }))] }));
}
