import React from 'react';
import { EmptyState, str, navProps, type WidgetRenderProps } from './shared';

export function ImageRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const src = str(c.src);

  if (!src) return <EmptyState cls={cls} ctx={ctx} label="Image" />;

  const img = (
    <img
      className={cls('image')}
      src={src}
      alt={str(c.alt)}
      loading="lazy"
      data-ratio={d.ratio ?? 'auto'}
      data-fit={d.fit ?? 'cover'}
    />
  );
  const link = str(c.link);

  return (
    <figure className={cls('root')}>
      {link ? (
        <a
          {...navProps(link, ctx.isEditing ?? false, '_blank')}
          onClick={() => !ctx.isEditing && ctx.track({ type: 'WIDGET_CLICK', part: 'image' })}
        >
          {img}
        </a>
      ) : (
        img
      )}
      {d.showCaption && str(c.caption) && (
        <figcaption className={cls('caption')}>{str(c.caption)}</figcaption>
      )}
    </figure>
  );
}
