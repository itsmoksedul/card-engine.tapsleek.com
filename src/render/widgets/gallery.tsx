import React from 'react';
import { asArray, EmptyState, str, type WidgetRenderProps } from './shared';

export function GalleryRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const items = asArray<Record<string, unknown>>(c.items);

  if (!items.length) return <EmptyState cls={cls} ctx={ctx} label="No images yet" />;

  return (
    <div className={cls('root')}>
      {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
      <div className={cls('list')} data-layout={d.layout ?? 'grid-2'}>
        {items.map((item, i) => (
          <figure key={i} className={cls('item')}>
            <img
              className={cls('image')}
              src={str(item.url)}
              alt={str(item.caption)}
              loading="lazy"
              style={d.ratio && d.ratio !== 'auto' ? { aspectRatio: d.ratio } : undefined}
            />
            {d.showCaption && str(item.caption) && (
              <figcaption className={cls('caption')}>{str(item.caption)}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
