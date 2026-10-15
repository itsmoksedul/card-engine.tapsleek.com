import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { RenderIcon } from './icon-helper';
import { EmptyState, str, iconVal, navProps } from './shared';
export function IconBoxRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const title = str(c.title);
    const icon = iconVal(c.icon);
    if (!title && !icon)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Icon Box" });
    const inner = (_jsxs(_Fragment, { children: [icon && _jsx(RenderIcon, { name: icon, className: cls('icon') }), title && _jsx("div", { className: cls('title'), children: title }), d.showDescription !== false && str(c.description) && (_jsx("div", { className: cls('description'), children: str(c.description) }))] }));
    const link = str(c.link);
    return (_jsx("div", { className: cls('root'), "data-layout": d.layout ?? 'top', children: link ? (_jsx("a", { ...navProps(link, ctx.isEditing ?? false, '_blank'), onClick: () => !ctx.isEditing && ctx.track({ type: 'WIDGET_CLICK', part: 'root' }), children: inner })) : (inner) }));
}
