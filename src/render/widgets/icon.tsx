import React from 'react';
import { RenderIcon } from './icon-helper';
import { EmptyState, str, type WidgetRenderProps } from './shared';

export function IconRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const icon = str(c.icon);

  if (!icon) return <EmptyState cls={cls} ctx={ctx} label="Icon" />;

  const glyph = <RenderIcon name={icon} className={cls('icon')} />;
  const link = str(c.link);

  return (
    <div className={cls('root')} data-align={d.align ?? 'center'}>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          onClick={() => ctx.track({ type: 'WIDGET_CLICK', part: 'icon' })}
        >
          {glyph}
        </a>
      ) : (
        glyph
      )}
    </div>
  );
}
