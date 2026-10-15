import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sanitizeHtml } from '../sanitize';
import { EmptyState, str } from './shared';
export function RichTextRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const title = str(c.title);
    const body = str(c.body);
    if (!title && !body)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Text" });
    return (_jsxs("div", { className: cls('root'), "data-align": d.align ?? 'left', children: [d.showTitle !== false && title && _jsx("h2", { className: cls('title'), children: title }), body && (_jsx("div", { className: cls('body'), dangerouslySetInnerHTML: { __html: sanitizeHtml(body, 'richtext') } }))] }));
}
