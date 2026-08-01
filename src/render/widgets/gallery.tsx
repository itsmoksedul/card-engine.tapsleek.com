import React from 'react';
import { asArray, EmptyState, str, type WidgetRenderProps } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';

export function GalleryRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const items = asArray<Record<string, unknown>>(c.items);

  if (!items.length) return <EmptyState cls={cls} ctx={ctx} label="No images yet" />;

  const layout = d.layout ?? 'grid-2';

  const renderedItems = items.map((item, i) => (
    <figure key={i} className={cls('item')}>
      <img
        className={cls('image')}
        src={str(item.url) || undefined}
        alt={str(item.caption)}
        loading="lazy"
        style={d.ratio && d.ratio !== 'auto' ? { aspectRatio: d.ratio } : undefined}
      />
      {d.showCaption && str(item.caption) && (
        <figcaption className={cls('caption')}>{str(item.caption)}</figcaption>
      )}
    </figure>
  ));

  return (
    <div className={cls('root')}>
      {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
      
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
