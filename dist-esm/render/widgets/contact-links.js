import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { linkDef } from '../../catalog/links';
import { RenderIcon } from './icon-helper';
import { asArray, EmptyState, navProps } from './shared';
/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived. Links stay a first-class DB entity because they carry per-link
 * click analytics, so this widget only decides which ones appear and how they
 * look. `data-link-id` is what the click beacon reads.
 */
export function ContactLinksRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const categories = Array.isArray(d.categories) ? d.categories : [];
    const max = Number(d.max) > 0 ? Number(d.max) : Infinity;
    const demoItems = asArray(c.links);
    let links = asArray(ctx.links);
    if (!links.length && demoItems.length)
        links = demoItems;
    if (categories.length)
        links = links.filter((l) => categories.includes(l.category));
    links = links.slice(0, max);
    if (!links.length)
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No links yet" });
    return (_jsx("div", { className: cls('root'), "data-layout": d.layout ?? 'stack', children: _jsx("div", { className: cls('list'), children: links.map((link, idx) => (_jsxs("a", { className: cls('item'), "data-link-id": link.id, "data-link-type": link.type, ...navProps(link.url || link.value, ctx.isEditing ?? false, '_blank'), onClick: (e) => {
                    if (ctx.onActionClick && !ctx.isEditing) {
                        e.preventDefault();
                        ctx.onActionClick('link');
                    }
                }, children: [d.showIcon !== false && (_jsx(RenderIcon, { name: linkDef(link.type)?.type ??
                            linkDef(link.title || link.label || '')?.type ??
                            (link.icon || link.type), className: cls('icon') })), _jsx("span", { className: cls('label'), children: link.title || link.label || link.type }), d.showValue && link.value && _jsx("span", { className: cls('value'), children: link.value })] }, link.id || idx))) }) }));
}
