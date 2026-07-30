"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactLinksRender = ContactLinksRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const icon_helper_1 = require("./icon-helper");
const shared_1 = require("./shared");
/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived. Links stay a first-class DB entity because they carry per-link
 * click analytics, so this widget only decides which ones appear and how they
 * look. `data-link-id` is what the click beacon reads.
 */
function ContactLinksRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const categories = Array.isArray(d.categories) ? d.categories : [];
    const max = Number(d.max) > 0 ? Number(d.max) : Infinity;
    const demoItems = (0, shared_1.asArray)(c.links);
    let links = demoItems.length ? demoItems : (0, shared_1.asArray)(ctx.links);
    if (categories.length)
        links = links.filter((l) => categories.includes(l.category));
    links = links.slice(0, max);
    if (!links.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No links yet" });
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-layout": d.layout ?? 'stack', children: (0, jsx_runtime_1.jsx)("div", { className: cls('list'), children: links.map((link, idx) => ((0, jsx_runtime_1.jsxs)("a", { className: cls('item'), "data-link-id": link.id, "data-link-type": link.type, ...(0, shared_1.navProps)(link.url || link.value, ctx.isEditing ?? false, '_blank'), onClick: () => !ctx.isEditing && ctx.track({ type: 'LINK_CLICK', linkId: link.id }), children: [d.showIcon !== false && (0, jsx_runtime_1.jsx)(icon_helper_1.RenderIcon, { name: link.icon || link.type, className: cls('icon') }), (0, jsx_runtime_1.jsx)("span", { className: cls('label'), children: link.title || link.label || link.type }), d.showValue && link.value && (0, jsx_runtime_1.jsx)("span", { className: cls('value'), children: link.value })] }, link.id || idx))) }) }));
}
