import React from 'react';
import { asArray, EmptyState, str, type WidgetRenderProps } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';

export function FaqRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const items = asArray<Record<string, unknown>>(c.items);

  if (!items.length) return <EmptyState cls={cls} ctx={ctx} label="No questions yet" />;

  const renderedItems = items.map((item, i) => (
    // <details> gives working accordion behaviour with no client JS,
    // which keeps a text-only card at zero KB of JavaScript.
    <details
      key={i}
      className={cls('item')}
      open={d.openFirst !== false && i === 0}
      name={d.singleOpen !== false ? 'faq' : undefined}
    >
      <summary className={cls('question')} data-marker={d.marker ?? 'chevron'}>
        {str(item.question)}
        <span className={cls('chevron')} aria-hidden />
      </summary>
      <div className={cls('answer')}>{str(item.answer)}</div>
    </details>
  ));

  return (
    <div className={cls('root')}>
      {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
      {c.useCarousel ? (
        <NativeCarousel cls={cls} items={renderedItems} />
      ) : (
        <div className={cls('list')}>
          {renderedItems}
        </div>
      )}
    </div>
  );
}
