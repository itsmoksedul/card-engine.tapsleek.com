import { jsx as _jsx } from "react/jsx-runtime";
/** Card owner's display name, assembled the same way the backend vCard does. */
export function displayName(card) {
    const name = [card?.firstName, card?.lastName].filter(Boolean).join(' ').trim();
    if (name || card?.name)
        return name || card?.name;
    const hasUserIdentity = Boolean(card?.jobTitle ||
        card?.companyName ||
        card?.profileImage ||
        card?.avatar);
    if (card?.showPlaceholders && !hasUserIdentity)
        return 'John Doe';
    return '';
}
/** Job title · Company — skips the separator when either side is missing. */
export function subtitleOf(card) {
    const hasUserIdentity = Boolean(card?.firstName ||
        card?.lastName ||
        card?.name ||
        card?.jobTitle ||
        card?.companyName ||
        card?.profileImage ||
        card?.avatar);
    const title = card?.jobTitle ||
        (card?.showPlaceholders && !hasUserIdentity ? 'Job title' : '');
    const comp = card?.companyName ||
        (card?.showPlaceholders && !hasUserIdentity ? 'Company' : '');
    return [title, comp].filter(Boolean).join(' · ');
}
export function asArray(value) {
    return Array.isArray(value) ? value : [];
}
export function str(value) {
    return typeof value === 'string' ? value : '';
}
export function iconVal(value) {
    return (typeof value === 'string' || typeof value === 'object') ? value : null;
}
/**
 * Navigation props for links in editing mode.
 *
 * When the admin is editing a template in the builder canvas, real links would
 * navigate away or open external URLs, breaking the editing flow. This helper
 * suppresses navigation in edit mode while preserving the hover/focus UX.
 */
export function navProps(href, isEditing, target) {
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
export function EmptyState({ cls, ctx, label, }) {
    if (!ctx.isEditing)
        return null;
    return (_jsx("div", { className: cls('root'), "data-empty": "true", "data-placeholder": label, children: label }));
}
