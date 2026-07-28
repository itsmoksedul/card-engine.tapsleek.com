import React from 'react';
import type { WidgetRenderProps } from './shared';

export function DividerRender({ design, cls }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  return (
    <div className={cls('root')} role="separator" aria-hidden>
      <div className={cls('line')} data-style={d.style ?? 'solid'} />
    </div>
  );
}
