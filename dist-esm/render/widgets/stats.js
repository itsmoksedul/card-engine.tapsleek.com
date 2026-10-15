import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState } from './shared';
export function StatsRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = asArray(c.items);
    if (!items.length) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No stats added" });
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
    return (_jsx("div", { className: cls('root'), children: _jsx("div", { className: cls('list'), style: { gridTemplateColumns }, children: items.map((item, i) => (_jsxs("div", { className: cls('item'), style: {
                    textAlign: align,
                    borderBottom: showBorders && layout === 'stack' && i < items.length - 1 ? '1px solid var(--tw-border-color)' : undefined,
                    borderRight: showBorders && layout !== 'stack' && (i + 1) % (layout === 'grid-3' ? 3 : 2) !== 0 ? '1px solid var(--tw-border-color)' : undefined,
                    paddingBottom: showBorders && layout === 'stack' ? '12px' : undefined,
                }, children: [_jsx("div", { className: cls('value'), children: item.value }), _jsx("div", { className: cls('label'), children: item.label })] }, i))) }) }));
}
