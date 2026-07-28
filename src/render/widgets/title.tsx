import React from 'react';
import { EmptyState, str, type WidgetRenderProps } from './shared';

export function TitleRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const text = str(c.text);

  if (!text) return <EmptyState cls={cls} ctx={ctx} label="Title" />;

  const Tag = (['h1', 'h2', 'h3'].includes(d.level) ? d.level : 'h2') as 'h1' | 'h2' | 'h3';

  return (
    <div className={cls('root')} data-align={d.align ?? 'left'}>
      <Tag className={cls('text')}>{text}</Tag>
    </div>
  );
}
