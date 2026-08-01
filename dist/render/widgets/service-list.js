"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceListRender = ServiceListRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
const NativeCarousel_1 = require("../components/NativeCarousel");
/**
 * SERVICE_LIST — the reference content widget.
 *
 * `data-layout` carries the list/grid/carousel choice so the admin can style
 * each variant in CSS without this component branching on it.
 */
function ServiceListRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No services yet" });
    const layout = d.layout ?? 'grid-2';
    const renderedItems = items.map((item, i) => {
        const Wrapper = (0, shared_1.str)(item.link) ? 'a' : 'div';
        return ((0, jsx_runtime_1.jsxs)(Wrapper, { className: cls('item'), ...((0, shared_1.str)(item.link)
                ? {
                    href: (0, shared_1.str)(item.link),
                    target: '_blank',
                    rel: 'noreferrer',
                    onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'itemLink', index: i }),
                }
                : {}), children: [d.showMedia !== false && (0, shared_1.str)(item.image) && ((0, jsx_runtime_1.jsx)("img", { className: cls('itemMedia'), src: (0, shared_1.str)(item.image) || undefined, alt: "", loading: "lazy", style: { aspectRatio: d.mediaRatio ?? '4/3' } })), (0, jsx_runtime_1.jsx)("span", { className: cls('itemTitle'), children: (0, shared_1.str)(item.name) }), d.showDesc !== false && (0, shared_1.str)(item.description) && ((0, jsx_runtime_1.jsx)("span", { className: cls('itemDesc'), children: (0, shared_1.str)(item.description) })), d.showPrice && (0, shared_1.str)(item.price) && ((0, jsx_runtime_1.jsx)("span", { className: cls('itemPrice'), children: (0, shared_1.str)(item.price) }))] }, i));
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [((0, shared_1.str)(c.title) || (0, shared_1.str)(c.description)) && ((0, jsx_runtime_1.jsxs)("div", { className: cls('header'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), (0, shared_1.str)(c.description) && (0, jsx_runtime_1.jsx)("p", { className: cls('description'), children: (0, shared_1.str)(c.description) })] })), c.useCarousel ? ((0, jsx_runtime_1.jsx)(NativeCarousel_1.NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : ((0, jsx_runtime_1.jsx)("div", { className: cls('list'), "data-layout": layout, children: renderedItems }))] }));
}
