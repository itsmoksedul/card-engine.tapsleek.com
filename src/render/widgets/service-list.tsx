import React from 'react';
import { asArray, EmptyState, str, type WidgetRenderProps } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';

/**
 * SERVICE_LIST — the reference content widget.
 *
 * `data-layout` carries the list/grid/carousel choice so the admin can style
 * each variant in CSS without this component branching on it.
 */
export function ServiceListRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const items = asArray<Record<string, unknown>>(c.items);

  if (!items.length) return <EmptyState cls={cls} ctx={ctx} label="No services yet" />;

  const layout = d.layout ?? 'grid-2';

  const renderedItems = items.map((item, i) => {
    const Wrapper: any = str(item.link) ? 'a' : 'div';
    return (
      <Wrapper
        key={i}
        className={cls('item')}
        {...(str(item.link)
          ? {
              href: str(item.link),
              target: '_blank',
              rel: 'noreferrer',
              onClick: () => ctx.track({ type: 'WIDGET_CLICK', part: 'itemLink', index: i }),
            }
          : {})}
      >
        {d.showMedia !== false && str(item.image) && (
          <img
            className={cls('itemMedia')}
            src={str(item.image)}
            alt=""
            loading="lazy"
            style={{ aspectRatio: d.mediaRatio ?? '4/3' }}
          />
        )}
        <span className={cls('itemTitle')}>{str(item.name)}</span>
        {d.showDesc !== false && str(item.description) && (
          <span className={cls('itemDesc')}>{str(item.description)}</span>
        )}
        {d.showPrice && str(item.price) && (
          <span className={cls('itemPrice')}>{str(item.price)}</span>
        )}
      </Wrapper>
    );
  });

  return (
    <div className={cls('root')}>
      {(str(c.title) || str(c.description)) && (
        <div className={cls('header')}>
          {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
          {str(c.description) && <p className={cls('description')}>{str(c.description)}</p>}
        </div>
      )}

      {c.useCarousel ? (
        <NativeCarousel cls={cls} items={renderedItems} layout={layout} />
      ) : (
        <div className={cls('list')} data-layout={layout}>
          {renderedItems}
        </div>
      )}
    </div>
  );
}
