import React from 'react';
import { asArray, EmptyState, type WidgetRenderProps } from './shared';

export function PriceListRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const items = asArray<any>(c.items);

  if (!items.length) {
    return <EmptyState cls={cls} ctx={ctx} label="No price list items" />;
  }

  const showDots = d.showDots !== false;
  const showDividers = d.showDividers === true;

  return (
    <div className={cls('root')}>
      {c.heading && <h3 className={cls('heading')}>{c.heading}</h3>}
      
      <div className={cls('list')}>
        {items.map((item, i) => (
          <div 
            key={i} 
            className={cls('item')}
            style={showDividers && i < items.length - 1 ? { borderBottom: '1px solid var(--tw-border-color)', paddingBottom: '12px' } : undefined}
          >
            <div className={cls('titleRow')}>
              <div className={cls('title')}>{item.title}</div>
              {showDots && <div className={cls('dots')} />}
              {!showDots && <div style={{ flex: 1 }} />}
              {item.price && <div className={cls('price')}>{item.price}</div>}
            </div>
            {item.description && <div className={cls('description')}>{item.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
