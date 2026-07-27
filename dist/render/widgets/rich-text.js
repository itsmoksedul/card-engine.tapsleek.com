"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextRender = RichTextRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function RichTextRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const title = (0, shared_1.str)(c.title);
    const body = (0, shared_1.str)(c.body);
    if (!title && !body)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "Text" });
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), "data-align": d.align ?? 'left', children: [d.showTitle !== false && title && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: title }), body && (0, jsx_runtime_1.jsx)("div", { className: cls('body'), dangerouslySetInnerHTML: { __html: body } })] }));
}
