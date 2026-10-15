import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NativeCarousel } from "../components/NativeCarousel";
import { asArray, EmptyState } from "./shared";
export function PriceListRender({ design, content, cls, ctx, }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = asArray(c.items);
    if (!items.length) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No price list items" });
    }
    const showDots = d.showDots !== false;
    const showDividers = d.showDividers === true;
    const renderedItems = items.map((item, i) => (_jsxs("div", { className: cls("item"), style: showDividers && i < items.length - 1
            ? {
                borderBottom: "1px solid var(--tw-border-color)",
                paddingBottom: "12px",
            }
            : undefined, children: [_jsxs("div", { className: cls("titleRow"), children: [_jsx("div", { className: cls("title"), children: item.title }), showDots && _jsx("div", { className: cls("dots") }), !showDots && _jsx("div", { style: { flex: 1 } }), item.price && _jsx("div", { className: cls("price"), children: item.price })] }), item.description && (_jsx("div", { className: cls("description"), children: item.description }))] }, i)));
    return (_jsxs("div", { className: cls("root"), children: [c.heading && _jsx("h3", { className: cls("heading"), children: c.heading }), c.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems })) : (_jsx("div", { className: cls("list"), children: renderedItems }))] }));
}
