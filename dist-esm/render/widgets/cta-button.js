import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RenderIcon } from './icon-helper';
import { EmptyState, str, iconVal, navProps } from './shared';
export function CtaButtonRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const label = str(c.label);
    if (!label)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Button" });
    return (_jsxs("div", { className: cls('root'), "data-full-width": d.fullWidth !== false ? 'true' : undefined, children: [_jsxs("a", { className: cls('button'), ...navProps(str(c.url), ctx.isEditing ?? false, c.newTab ? '_blank' : undefined), "data-icon-position": d.iconPosition ?? 'left', onClick: () => !ctx.isEditing && ctx.track({ type: 'WIDGET_CLICK', part: 'button' }), children: [d.showIcon !== false && iconVal(c.icon) && (_jsx(RenderIcon, { name: iconVal(c.icon), className: cls('icon') })), _jsx("span", { className: cls('label'), children: label })] }), str(c.caption) && _jsx("span", { className: cls('caption'), children: str(c.caption) })] }));
}
