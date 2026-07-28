"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRender = ImageRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function ImageRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const src = (0, shared_1.str)(c.src);
    if (!src)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Image" });
    const img = ((0, jsx_runtime_1.jsx)("img", { className: cls('image'), src: src, alt: (0, shared_1.str)(c.alt), loading: "lazy", "data-ratio": d.ratio ?? 'auto', "data-fit": d.fit ?? 'cover' }));
    const link = (0, shared_1.str)(c.link);
    return ((0, jsx_runtime_1.jsxs)("figure", { className: cls('root'), children: [link ? ((0, jsx_runtime_1.jsx)("a", { href: link, target: "_blank", rel: "noreferrer", onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'image' }), children: img })) : (img), d.showCaption && (0, shared_1.str)(c.caption) && ((0, jsx_runtime_1.jsx)("figcaption", { className: cls('caption'), children: (0, shared_1.str)(c.caption) }))] }));
}
