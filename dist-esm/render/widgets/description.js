import { jsx as _jsx } from "react/jsx-runtime";
import { EmptyState, str } from './shared';
export function DescriptionRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const text = str(c.text);
    if (!text)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "Description" });
    return (_jsx("div", { className: cls('root'), "data-align": d.align ?? 'left', children: _jsx("p", { className: cls('text'), children: text }) }));
}
