"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactLinksRender = ContactLinksRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived. Links stay a first-class DB entity because they carry per-link
 * click analytics, so this widget only decides which ones appear and how they
 * look. `data-link-id` is what the click beacon reads.
 */
function ContactLinksRender({ design, cls, ctx }) {
    const d = (design ?? {});
    const categories = Array.isArray(d.categories) ? d.categories : [];
    const max = Number(d.max) > 0 ? Number(d.max) : Infinity;
    let links = (0, shared_1.asArray)(ctx.links);
    if (categories.length)
        links = links.filter((l) => categories.includes(l.category));
    links = links.slice(0, max);
    if (!links.length)
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No links yet" });
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-layout": d.layout ?? 'stack', children: (0, jsx_runtime_1.jsx)("div", { className: cls('list'), children: links.map((link) => ((0, jsx_runtime_1.jsxs)("a", { className: cls('item'), "data-link-id": link.id, "data-link-type": link.type, href: link.value || '#', target: "_blank", rel: "noreferrer", onClick: () => ctx.track({ type: 'LINK_CLICK', linkId: link.id }), children: [d.showIcon !== false && (0, jsx_runtime_1.jsx)("span", { className: cls('icon'), "data-icon": link.type, "aria-hidden": true }), (0, jsx_runtime_1.jsx)("span", { className: cls('label'), children: link.label || link.type }), d.showValue && (0, jsx_runtime_1.jsx)("span", { className: cls('value'), children: link.value })] }, link.id))) }) }));
}
