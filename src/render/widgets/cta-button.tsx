import React from 'react';
import { RenderIcon } from './icon-helper';
import { EmptyState, str, iconVal, type WidgetRenderProps } from './shared';

export function CtaButtonRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const label = str(c.label);

  if (!label) return <EmptyState cls={cls} ctx={ctx} label="Button" />;

  return (
    <div className={cls('root')} data-full-width={d.fullWidth !== false ? 'true' : undefined}>
      <a
        className={cls('button')}
        href={str(c.url) || '#'}
        target={c.newTab ? '_blank' : undefined}
        rel={c.newTab ? 'noreferrer' : undefined}
        data-icon-position={d.iconPosition ?? 'left'}
        onClick={() => ctx.track({ type: 'WIDGET_CLICK', part: 'button' })}
      >
        {d.showIcon !== false && iconVal(c.icon) && (
          <RenderIcon name={iconVal(c.icon) as any} className={cls('icon')} />
        )}
        <span className={cls('label')}>{label}</span>
      </a>
      {str(c.caption) && <span className={cls('caption')}>{str(c.caption)}</span>}
    </div>
  );
}
