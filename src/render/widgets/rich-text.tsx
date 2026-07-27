import React from 'react';
import { EmptyState, str, type WidgetRenderProps } from './shared';

export function RichTextRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const title = str(c.title);
  const body = str(c.body);

  if (!title && !body) return <EmptyState cls={cls} ctx={ctx} label="Text" />;

  return (
    <div className={cls('root')} data-align={d.align ?? 'left'}>
      {d.showTitle !== false && title && <h2 className={cls('title')}>{title}</h2>}
      {/* Sanitised server-side on write — never trust this at render time. */}
      {body && <div className={cls('body')} dangerouslySetInnerHTML={{ __html: body }} />}
    </div>
  );
}
