import React from 'react';
import { asArray, EmptyState, type WidgetRenderProps } from './shared';

export function TimelineRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const items = asArray<any>(c.items);

  if (!items.length) {
    return <EmptyState cls={cls} ctx={ctx} label="No timeline events" />;
  }

  const bulletStyle = d.bulletStyle === 'circle' ? 'circle' : 'dot';

  return (
    <div className={cls('root')}>
      {c.heading && <h3 className={cls('heading')}>{c.heading}</h3>}
      
      <div className={cls('list')}>
        {items.map((item, i) => (
          <div key={i} className={cls('item')}>
            <div className={cls('bullet')} style={bulletStyle === 'circle' ? { background: 'transparent', border: '2px solid var(--tw-border-color, currentColor)' } : undefined} />
            {i < items.length - 1 && <div className={cls('line')} />}
            
            <div className={cls('content')}>
              {item.date && <div className={cls('date')}>{item.date}</div>}
              {item.title && <div className={cls('title')}>{item.title}</div>}
              {item.description && <div className={cls('description')}>{item.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
