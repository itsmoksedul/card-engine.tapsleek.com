import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NativeCarousel } from "../components/NativeCarousel";
import { asArray, EmptyState, str } from "./shared";
export function TeamRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = asArray(c.items);
    if (!items.length) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No team members added" });
    }
    const layout = d.layout || "grid-2";
    const align = d.align || "center";
    const avatarShape = d.avatarShape || "circle";
    let gridTemplateColumns = "1fr";
    if (layout === "grid-2")
        gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
    else if (layout === "grid-3")
        gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    const renderedItems = items.map((item, i) => (_jsxs("div", { className: cls("item"), style: {
            alignItems: align === "center" ? "center" : "flex-start",
            textAlign: align,
        }, children: [item.image ? (_jsx("img", { src: str(item.image) || undefined, alt: str(item.name) || "Team member", className: cls("avatar"), style: { borderRadius: avatarShape === "circle" ? "9999px" : "12px" }, loading: "lazy" })) : (_jsx("div", { className: cls("avatar"), style: {
                    borderRadius: avatarShape === "circle" ? "9999px" : "12px",
                    backgroundColor: "var(--tw-border-color, #e2e8f0)",
                } })), _jsxs("div", { className: cls("content"), children: [item.name && _jsx("div", { className: cls("name"), children: item.name }), item.role && _jsx("div", { className: cls("role"), children: item.role }), item.bio && _jsx("div", { className: cls("bio"), children: item.bio })] })] }, i)));
    return (_jsxs("div", { className: cls("root"), children: [c.heading && _jsx("h3", { className: cls("heading"), children: c.heading }), c.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : (_jsx("div", { className: cls("list"), style: { gridTemplateColumns }, children: renderedItems }))] }));
}
