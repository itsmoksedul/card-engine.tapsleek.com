import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState, str, imgSize } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';
/**
 * SERVICE_LIST — the reference content widget.
 *
 * `data-layout` carries the list/grid/carousel choice so the admin can style
 * each variant in CSS without this component branching on it.
 */
export function ServiceListRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = asArray(c.items);
    if (!items.length)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No services yet" });
    const layout = d.layout ?? 'grid-2';
    const renderedItems = items.map((item, i) => {
        const Wrapper = str(item.link) ? 'a' : 'div';
        return (_jsxs(Wrapper, { className: cls('item'), ...(str(item.link)
                ? {
                    href: str(item.link),
                    target: '_blank',
                    rel: 'noreferrer',
                    onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'itemLink', index: i }),
                }
                : {}), children: [d.showMedia !== false && str(item.image) && (_jsx("img", { className: cls('itemMedia'), src: str(item.image) || undefined, ...imgSize(ctx.card, str(item.image)), alt: "", loading: "lazy", style: { aspectRatio: d.mediaRatio ?? '4/3' } })), _jsx("span", { className: cls('itemTitle'), children: str(item.name) }), d.showDesc !== false && str(item.description) && (_jsx("span", { className: cls('itemDesc'), children: str(item.description) })), d.showPrice && str(item.price) && (_jsx("span", { className: cls('itemPrice'), children: str(item.price) }))] }, i));
    });
    return (_jsxs("div", { className: cls('root'), children: [(str(c.title) || str(c.description)) && (_jsxs("div", { className: cls('header'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), str(c.description) && _jsx("p", { className: cls('description'), children: str(c.description) })] })), c.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : (_jsx("div", { className: cls('list'), "data-layout": layout, children: renderedItems }))] }));
}
