import { jsx as _jsx } from "react/jsx-runtime";
import { RenderIcon } from './icon-helper';
import { EmptyState, str, iconVal, navProps } from './shared';
export function IconRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const icon = iconVal(c.icon);
    if (!icon)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Icon" });
    const glyph = _jsx(RenderIcon, { name: icon, className: cls('icon') });
    const link = str(c.link);
    return (_jsx("div", { className: cls('root'), "data-align": d.align ?? 'center', children: link ? (_jsx("a", { ...navProps(link, ctx.isEditing ?? false, '_blank'), onClick: () => !ctx.isEditing && ctx.track({ type: 'WIDGET_CLICK', part: 'icon' }), children: glyph })) : (glyph) }));
}
