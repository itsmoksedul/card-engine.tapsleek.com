import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState, str, imgSize } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';
export function GalleryRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = asArray(c.items);
    if (!items.length)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No images yet" });
    const layout = d.layout ?? 'grid-2';
    const renderedItems = items.map((item, i) => (_jsxs("figure", { className: cls('item'), children: [_jsx("img", { className: cls('image'), src: str(item.url) || undefined, ...imgSize(ctx.card, str(item.url)), alt: str(item.caption), loading: "lazy", style: d.ratio && d.ratio !== 'auto' ? { aspectRatio: d.ratio } : undefined }), d.showCaption && str(item.caption) && (_jsx("figcaption", { className: cls('caption'), children: str(item.caption) }))] }, i)));
    return (_jsxs("div", { className: cls('root'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), d.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : (_jsx("div", { className: cls('list'), "data-layout": layout, children: renderedItems }))] }));
}
