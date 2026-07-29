"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconBoxRender = IconBoxRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const icon_helper_1 = require("./icon-helper");
const shared_1 = require("./shared");
function IconBoxRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const title = (0, shared_1.str)(c.title);
    const icon = (0, shared_1.iconVal)(c.icon);
    if (!title && !icon)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Icon Box" });
    const inner = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [icon && (0, jsx_runtime_1.jsx)(icon_helper_1.RenderIcon, { name: icon, className: cls('icon') }), title && (0, jsx_runtime_1.jsx)("div", { className: cls('title'), children: title }), d.showDescription !== false && (0, shared_1.str)(c.description) && ((0, jsx_runtime_1.jsx)("div", { className: cls('description'), children: (0, shared_1.str)(c.description) }))] }));
    const link = (0, shared_1.str)(c.link);
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-layout": d.layout ?? 'top', children: link ? ((0, jsx_runtime_1.jsx)("a", { href: link, target: "_blank", rel: "noreferrer", onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'root' }), children: inner })) : (inner) }));
}
