"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayName = displayName;
exports.subtitleOf = subtitleOf;
exports.asArray = asArray;
exports.str = str;
exports.iconVal = iconVal;
exports.EmptyState = EmptyState;
const jsx_runtime_1 = require("react/jsx-runtime");
/** Card owner's display name, assembled the same way the backend vCard does. */
function displayName(card) {
    const name = [card?.firstName, card?.lastName].filter(Boolean).join(' ').trim();
    return name || card?.name || '';
}
/** Job title · Company — skips the separator when either side is missing. */
function subtitleOf(card) {
    return [card?.jobTitle, card?.companyName].filter(Boolean).join(' · ');
}
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
function str(value) {
    return typeof value === 'string' ? value : '';
}
function iconVal(value) {
    return (typeof value === 'string' || typeof value === 'object') ? value : null;
}
/**
 * In the builder an empty widget would collapse to nothing and become
 * unselectable, so mark it instead of returning null. On a live card the same
 * widget renders nothing at all.
 */
function EmptyState({ cls, ctx, label, }) {
    if (!ctx.isEditing)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-empty": "true", "data-placeholder": label, children: label }));
}
