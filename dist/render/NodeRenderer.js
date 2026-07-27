"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRenderer = NodeRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const resolveBinding_1 = require("./resolveBinding");
const widgets_1 = require("./widgets");
function NodeRenderer({ node, content, ctx }) {
    if (node.kind === 'element') {
        return (0, jsx_runtime_1.jsx)(ElementRenderer, { node: node, content: content, ctx: ctx });
    }
    if (node.kind === 'widget') {
        return (0, jsx_runtime_1.jsx)(WidgetRenderer, { node: node, content: content, ctx: ctx });
    }
    if (node.kind === 'slot') {
        return (0, jsx_runtime_1.jsx)(SlotRenderer, { node: node, content: content, ctx: ctx });
    }
    return null;
}
function ElementRenderer({ node, content, ctx }) {
    const boundValue = (0, resolveBinding_1.resolveBinding)(node.bind, ctx.card, content);
    if (node.hideIfEmpty && boundValue === undefined) {
        return null;
    }
    const Tag = (node.tag === 'frame' ? (node.props?.as || 'div') :
        node.tag === 'heading' ? `h${node.props?.level || 2}` :
            node.tag === 'text' ? 'p' :
                node.tag === 'image' ? 'img' : 'div');
    const props = { ...node.props, className: `n${node.id}` };
    if (ctx.isEditing) {
        props['data-node-id'] = node.id;
        props.onClick = (e) => {
            e.stopPropagation();
            window.parent.postMessage({ type: 'SELECT_NODE', id: node.id }, '*');
        };
        props.className += ' cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-inset transition-all';
    }
    if (node.tag === 'image') {
        props.src = boundValue || props.src;
    }
    else if (node.tag === 'heading' || node.tag === 'text') {
        props.children = boundValue || props.text;
    }
    return ((0, jsx_runtime_1.jsxs)(Tag, { ...props, children: [props.children, node.children?.map(child => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: child, content: content, ctx: ctx }, child.id)))] }));
}
function WidgetRenderer({ node, content, ctx }) {
    const WidgetComp = widgets_1.WIDGET_RENDERERS[node.widget];
    if (!WidgetComp) {
        return (0, jsx_runtime_1.jsxs)("div", { className: `n${node.id} p-root`, children: ["Missing widget: ", node.widget] });
    }
    const widgetContent = content?.[node.key] ?? node.defaultContent;
    const handleSelect = ctx.isEditing ? (e) => {
        e.stopPropagation();
        window.parent.postMessage({ type: 'SELECT_NODE', id: node.id }, '*');
    } : undefined;
    return ((0, jsx_runtime_1.jsx)("div", { "data-node-id": ctx.isEditing ? node.id : undefined, onClick: handleSelect, className: ctx.isEditing ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-inset transition-all' : '', children: (0, jsx_runtime_1.jsx)(WidgetComp, { content: widgetContent, design: node.design, cls: (part) => `n${node.id} p-${part}`, ctx: ctx }) }));
}
function SlotRenderer({ node, content, ctx }) {
    const slotWidgets = content?.slots?.[node.key] || [];
    const handleSelect = ctx.isEditing ? (e) => {
        e.stopPropagation();
        window.parent.postMessage({ type: 'SELECT_NODE', id: node.id }, '*');
    } : undefined;
    return ((0, jsx_runtime_1.jsxs)("div", { className: `n${node.id} ${ctx.isEditing ? 'cursor-pointer hover:ring-2 hover:ring-dashed hover:ring-green-500 hover:ring-inset p-4 bg-green-50/50' : ''}`, "data-node-id": ctx.isEditing ? node.id : undefined, onClick: handleSelect, children: [slotWidgets.map((w) => ((0, jsx_runtime_1.jsx)(NodeRenderer, { node: w, content: content, ctx: ctx }, w.id))), ctx.isEditing && slotWidgets.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-sm text-green-700 font-medium", children: ["Empty Slot: ", node.key] }))] }));
}
