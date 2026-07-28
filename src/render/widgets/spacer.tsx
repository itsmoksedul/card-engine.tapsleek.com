import React from 'react';
import type { WidgetRenderProps } from './shared';

export function SpacerRender({ design, cls }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  // Pure layout: always renders (its height comes from partStyles), never empty.
  return <div className={cls('root')} data-size={d.size ?? 'md'} aria-hidden />;
}
