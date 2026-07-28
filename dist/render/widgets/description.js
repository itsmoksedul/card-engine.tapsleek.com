"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptionRender = DescriptionRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function DescriptionRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const text = (0, shared_1.str)(c.text);
    if (!text)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Description" });
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-align": d.align ?? 'left', children: (0, jsx_runtime_1.jsx)("p", { className: cls('text'), children: text }) }));
}
