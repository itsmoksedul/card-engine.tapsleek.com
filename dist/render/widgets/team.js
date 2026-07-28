"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRender = TeamRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function TeamRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const items = (0, shared_1.asArray)(c.items);
    if (!items.length) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No team members added" });
    }
    const layout = d.layout || 'grid-2';
    const align = d.align || 'center';
    const avatarShape = d.avatarShape || 'circle';
    let gridTemplateColumns = '1fr';
    if (layout === 'grid-2')
        gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    else if (layout === 'grid-3')
        gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [c.heading && (0, jsx_runtime_1.jsx)("h3", { className: cls('heading'), children: c.heading }), (0, jsx_runtime_1.jsx)("div", { className: cls('list'), style: { gridTemplateColumns }, children: items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: cls('item'), style: {
                        alignItems: align === 'center' ? 'center' : 'flex-start',
                        textAlign: align
                    }, children: [item.image ? ((0, jsx_runtime_1.jsx)("img", { src: item.image, alt: item.name || 'Team member', className: cls('avatar'), style: { borderRadius: avatarShape === 'circle' ? '9999px' : '12px' }, loading: "lazy" })) : ((0, jsx_runtime_1.jsx)("div", { className: cls('avatar'), style: {
                                borderRadius: avatarShape === 'circle' ? '9999px' : '12px',
                                backgroundColor: 'var(--tw-border-color, #e2e8f0)'
                            } })), (0, jsx_runtime_1.jsxs)("div", { className: cls('content'), children: [item.name && (0, jsx_runtime_1.jsx)("div", { className: cls('name'), children: item.name }), item.role && (0, jsx_runtime_1.jsx)("div", { className: cls('role'), children: item.role }), item.bio && (0, jsx_runtime_1.jsx)("div", { className: cls('bio'), children: item.bio })] })] }, i))) })] }));
}
