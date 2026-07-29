import React from 'react';
import { RenderIcon } from './icon-helper';
import { EmptyState, str, iconVal, type WidgetRenderProps } from './shared';

export function IconBoxRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const title = str(c.title);
  const icon = iconVal(c.icon);

  if (!title && !icon) return <EmptyState cls={cls} ctx={ctx} label="Icon Box" />;

  const inner = (
    <>
      {icon && <RenderIcon name={icon as any} className={cls('icon')} />}
      {title && <div className={cls('title')}>{title}</div>}
      {d.showDescription !== false && str(c.description) && (
        <div className={cls('description')}>{str(c.description)}</div>
      )}
    </>
  );
  const link = str(c.link);

  return (
    <div className={cls('root')} data-layout={d.layout ?? 'top'}>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          onClick={() => ctx.track({ type: 'WIDGET_CLICK', part: 'root' })}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
