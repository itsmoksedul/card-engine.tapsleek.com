import React from 'react';
import { str, type WidgetRenderProps } from './shared';

export function CopyrightRender({ content, cls }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const text = str(c.text) || '© 2026 TapSleek. All rights reserved.';

  return (
    <div className={cls('root')}>
      <span className={cls('text')}>{text}</span>
    </div>
  );
}
