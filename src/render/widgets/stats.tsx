import React from 'react';
import { asArray, EmptyState, type WidgetRenderProps } from './shared';

export function StatsRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const items = asArray<any>(c.items);

  if (!items.length) {
    return <EmptyState cls={cls} ctx={ctx} label="No stats added" />;
  }

  const layout = d.layout || 'grid-2';
  const align = d.align || 'center';
  const showBorders = d.showBorders === true;

  // Compute grid columns
  let gridTemplateColumns = '1fr';
  if (layout === 'grid-2') gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
  else if (layout === 'grid-3') gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';

  return (
    <div className={cls('root')}>
      <div 
        className={cls('list')} 
        style={{ gridTemplateColumns }}
      >
        {items.map((item, i) => (
          <div 
            key={i} 
            className={cls('item')} 
            style={{ 
              textAlign: align,
              borderBottom: showBorders && layout === 'stack' && i < items.length - 1 ? '1px solid var(--tw-border-color)' : undefined,
              borderRight: showBorders && layout !== 'stack' && (i + 1) % (layout === 'grid-3' ? 3 : 2) !== 0 ? '1px solid var(--tw-border-color)' : undefined,
              paddingBottom: showBorders && layout === 'stack' ? '12px' : undefined,
            }}
          >
            <div className={cls('value')}>{item.value}</div>
            <div className={cls('label')}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
