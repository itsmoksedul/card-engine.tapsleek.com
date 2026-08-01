import React from 'react';
import { asArray, EmptyState, str, type WidgetRenderProps } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';

export function TestimonialsRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const items = asArray<Record<string, unknown>>(c.items);

  if (!items.length) return <EmptyState cls={cls} ctx={ctx} label="No testimonials yet" />;

  const layout = d.layout ?? 'stack';

  const renderedItems = items.map((item, i) => {
    const rating = Number(item.rating);
    return (
      <figure key={i} className={cls('item')}>
        {d.quoteMark && d.quoteMark !== 'none' && (
          <span className={cls('mark')} data-size={d.quoteMark} aria-hidden />
        )}
        <blockquote className={cls('quote')}>{str(item.quote)}</blockquote>

        {d.showRating !== false && Number.isFinite(rating) && rating > 0 && (
          <div className={cls('stars')} aria-label={`${rating} out of 5`}>
            {Array.from({ length: 5 }, (_, s) => (
              <span key={s} data-filled={s < rating} aria-hidden />
            ))}
          </div>
        )}

        <figcaption className={cls('caption')}>
          {d.showAvatar !== false && str(item.avatar) && (
            <img className={cls('avatar')} src={str(item.avatar)} alt="" loading="lazy" />
          )}
          <span className={cls('author')}>{str(item.author)}</span>
          {str(item.role) && <span className={cls('role')}>{str(item.role)}</span>}
        </figcaption>
      </figure>
    );
  });

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
