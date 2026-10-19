import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EmptyState, str, navProps, imgSize } from './shared';
export function ImageRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const src = str(c.src);
    if (!src)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Image" });
    const img = (_jsx("img", { className: cls('image'), src: src, ...imgSize(ctx.card, src), alt: str(c.alt), loading: "lazy", "data-ratio": d.ratio ?? 'auto', "data-fit": d.fit ?? 'cover' }));
    const link = str(c.link);
    return (_jsxs("figure", { className: cls('root'), children: [link ? (_jsx("a", { ...navProps(link, ctx.isEditing ?? false, '_blank'), onClick: () => !ctx.isEditing && ctx.track({ type: 'WIDGET_CLICK', part: 'image' }), children: img })) : (img), d.showCaption && str(c.caption) && (_jsx("figcaption", { className: cls('caption'), children: str(c.caption) }))] }));
}
