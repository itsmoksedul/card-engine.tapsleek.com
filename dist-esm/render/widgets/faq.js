import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState, str } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';
export function FaqRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const items = asArray(c.items);
    if (!items.length)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No questions yet" });
    const renderedItems = items.map((item, i) => (
    // <details> gives working accordion behaviour with no client JS,
    // which keeps a text-only card at zero KB of JavaScript.
    _jsxs("details", { className: cls('item'), open: d.openFirst !== false && i === 0, name: d.singleOpen !== false ? 'faq' : undefined, children: [_jsxs("summary", { className: cls('question'), "data-marker": d.marker ?? 'chevron', children: [str(item.question), _jsx("span", { className: cls('chevron'), "aria-hidden": true })] }), _jsx("div", { className: cls('answer'), children: str(item.answer) })] }, i)));
    return (_jsxs("div", { className: cls('root'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), c.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems })) : (_jsx("div", { className: cls('list'), children: renderedItems }))] }));
}
