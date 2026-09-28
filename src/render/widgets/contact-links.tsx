import { linkDef } from '../../catalog/links';
import { RenderIcon } from './icon-helper';
import { asArray, EmptyState, navProps, type WidgetRenderProps } from './shared';

/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived. Links stay a first-class DB entity because they carry per-link
 * click analytics, so this widget only decides which ones appear and how they
 * look. `data-link-id` is what the click beacon reads.
 */
export function ContactLinksRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;
  const categories: string[] = Array.isArray(d.categories) ? d.categories : [];
  const max = Number(d.max) > 0 ? Number(d.max) : Infinity;

  const demoItems = asArray<any>(c.links);
  let links = asArray<any>(ctx.links);
  if (!links.length && demoItems.length) links = demoItems;
  if (categories.length) links = links.filter((l) => categories.includes(l.category));
  links = links.slice(0, max);

  if (!links.length) return <EmptyState cls={cls} ctx={ctx} label="No links yet" />;

  return (
    <div className={cls('root')} data-layout={d.layout ?? 'stack'}>
      <div className={cls('list')}>
        {links.map((link, idx) => (
          <a
            key={link.id || idx}
            className={cls('item')}
            data-link-id={link.id}
            data-link-type={link.type}
            {...navProps(link.url || link.value, ctx.isEditing ?? false, '_blank')}
            onClick={(e) => {
              if (ctx.onActionClick && !ctx.isEditing) {
                e.preventDefault();
                ctx.onActionClick('link');
              }
            }}
          >
            {d.showIcon !== false && <RenderIcon name={linkDef(link.type) ? link.type : (link.icon || link.type)} className={cls('icon')} />}
            <span className={cls('label')}>{link.title || link.label || link.type}</span>
            {d.showValue && link.value && <span className={cls('value')}>{link.value}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
