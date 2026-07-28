"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconRender = IconRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function IconRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const icon = (0, shared_1.str)(c.icon);
    if (!icon)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Icon" });
    const glyph = (0, jsx_runtime_1.jsx)("span", { className: cls('icon'), "data-icon": icon, "aria-hidden": true });
    const link = (0, shared_1.str)(c.link);
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-align": d.align ?? 'center', children: link ? ((0, jsx_runtime_1.jsx)("a", { href: link, target: "_blank", rel: "noreferrer", onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'icon' }), children: glyph })) : (glyph) }));
}
