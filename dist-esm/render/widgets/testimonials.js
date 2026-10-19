import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState, str, imgSize } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';
export function TestimonialsRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = asArray(c.items);
    if (!items.length)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No testimonials yet" });
    const layout = d.layout ?? 'stack';
    const renderedItems = items.map((item, i) => {
        const rating = Number(item.rating);
        return (_jsxs("figure", { className: cls('item'), children: [d.quoteMark && d.quoteMark !== 'none' && (_jsx("span", { className: cls('mark'), "data-size": d.quoteMark, "aria-hidden": true })), _jsx("blockquote", { className: cls('quote'), children: str(item.quote) }), d.showRating !== false && Number.isFinite(rating) && rating > 0 && (_jsx("div", { className: cls('stars'), "aria-label": `${rating} out of 5`, children: Array.from({ length: 5 }, (_, s) => (_jsx("span", { "data-filled": s < rating, "aria-hidden": true }, s))) })), _jsxs("figcaption", { className: cls('caption'), children: [d.showAvatar !== false && str(item.avatar) && (_jsx("img", { className: cls('avatar'), src: str(item.avatar) || undefined, ...imgSize(ctx.card, str(item.avatar)), alt: "", loading: "lazy" })), _jsx("span", { className: cls('author'), children: str(item.author) }), str(item.role) && _jsx("span", { className: cls('role'), children: str(item.role) })] })] }, i));
    });
    return (_jsxs("div", { className: cls('root'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), c.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : (_jsx("div", { className: cls('list'), "data-layout": layout, children: renderedItems }))] }));
}
