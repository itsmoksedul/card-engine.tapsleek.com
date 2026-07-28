"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsRender = StatsRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function StatsRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No stats added" });
    }
    const layout = d.layout || 'grid-2';
    const align = d.align || 'center';
    const showBorders = d.showBorders === true;
    // Compute grid columns
    let gridTemplateColumns = '1fr';
    if (layout === 'grid-2')
        gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    else if (layout === 'grid-3')
        gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), children: (0, jsx_runtime_1.jsx)("div", { className: cls('list'), style: { gridTemplateColumns }, children: items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: cls('item'), style: {
                    textAlign: align,
                    borderBottom: showBorders && layout === 'stack' && i < items.length - 1 ? '1px solid var(--tw-border-color)' : undefined,
                    borderRight: showBorders && layout !== 'stack' && (i + 1) % (layout === 'grid-3' ? 3 : 2) !== 0 ? '1px solid var(--tw-border-color)' : undefined,
                    paddingBottom: showBorders && layout === 'stack' ? '12px' : undefined,
                }, children: [(0, jsx_runtime_1.jsx)("div", { className: cls('value'), children: item.value }), (0, jsx_runtime_1.jsx)("div", { className: cls('label'), children: item.label })] }, i))) }) }));
}
