import { jsx as _jsx } from "react/jsx-runtime";
import { EmptyState, str } from './shared';
export function TitleRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const text = str(c.text);
    if (!text)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Title" });
    const Tag = (['h1', 'h2', 'h3'].includes(d.level) ? d.level : 'h2');
    return (_jsx("div", { className: cls('root'), "data-align": d.align ?? 'left', children: _jsx(Tag, { className: cls('text'), children: text }) }));
}
