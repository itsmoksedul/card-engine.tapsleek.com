"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtaButtonRender = CtaButtonRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const icon_helper_1 = require("./icon-helper");
const shared_1 = require("./shared");
function CtaButtonRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const label = (0, shared_1.str)(c.label);
    if (!label)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Button" });
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), "data-full-width": d.fullWidth !== false ? 'true' : undefined, children: [(0, jsx_runtime_1.jsxs)("a", { className: cls('button'), href: (0, shared_1.str)(c.url) || '#', target: c.newTab ? '_blank' : undefined, rel: c.newTab ? 'noreferrer' : undefined, "data-icon-position": d.iconPosition ?? 'left', onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'button' }), children: [d.showIcon !== false && (0, shared_1.str)(c.icon) && ((0, jsx_runtime_1.jsx)(icon_helper_1.RenderIcon, { name: (0, shared_1.str)(c.icon), className: cls('icon') })), (0, jsx_runtime_1.jsx)("span", { className: cls('label'), children: label })] }), (0, shared_1.str)(c.caption) && (0, jsx_runtime_1.jsx)("span", { className: cls('caption'), children: (0, shared_1.str)(c.caption) })] }));
}
