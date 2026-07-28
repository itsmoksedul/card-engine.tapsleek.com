import React from 'react';
import { EmptyState, str, type WidgetRenderProps } from './shared';

export function DescriptionRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const text = str(c.text);

  if (!text) return <EmptyState cls={cls} ctx={ctx} label="Description" />;

  return (
    <div className={cls('root')} data-align={d.align ?? 'left'}>
      <p className={cls('text')}>{text}</p>
    </div>
  );
}
