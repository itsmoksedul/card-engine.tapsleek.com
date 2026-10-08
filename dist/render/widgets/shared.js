"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayName = displayName;
exports.subtitleOf = subtitleOf;
exports.asArray = asArray;
exports.str = str;
exports.iconVal = iconVal;
exports.navProps = navProps;
exports.EmptyState = EmptyState;
const jsx_runtime_1 = require("react/jsx-runtime");
/** Card owner's display name, assembled the same way the backend vCard does. */
function displayName(card) {
    const name = [card?.firstName, card?.lastName].filter(Boolean).join(' ').trim();
    if (name || card?.name)
        return name || card?.name;
    if (card?.showPlaceholders)
        return 'John Doe';
    return '';
}
/** Job title · Company — skips the separator when either side is missing. */
function subtitleOf(card) {
    const title = card?.jobTitle || (card?.showPlaceholders ? 'Job title' : '');
    const comp = card?.companyName || (card?.showPlaceholders ? 'Company' : '');
    return [title, comp].filter(Boolean).join(' · ');
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
 * Navigation props for links in editing mode.
 *
 * When the admin is editing a template in the builder canvas, real links would
 * navigate away or open external URLs, breaking the editing flow. This helper
 * suppresses navigation in edit mode while preserving the hover/focus UX.
 */
function navProps(href, isEditing, target) {
    if (isEditing) {
        return {
            onClick: (e) => e.preventDefault(),
        };
    }
    return {
        href: href || '#',
        ...(target && { target }),
        ...(target === '_blank' && { rel: 'noreferrer' }),
    };
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
