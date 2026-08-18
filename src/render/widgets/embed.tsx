import React, { useMemo } from 'react';
import DOMPurify, { embedPurifier } from '../purify';
import { EmptyState, type WidgetRenderProps } from './shared';

const HEIGHT_MAP: Record<string, string> = {
  small: '150px',
  medium: '300px',
  large: '600px',
  full: '100vh',
  auto: '100%', // relying on iframe content or wrapper to size it
};

export function EmbedRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const rawHtml = String(c.html || '').trim();

  const sanitizedHtml = useMemo(() => {
    if (!rawHtml) return '';
    return embedPurifier.sanitize(rawHtml, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'marginheight', 'marginwidth'],
    });
  }, [rawHtml]);

  if (!sanitizedHtml) {
    return <EmptyState cls={cls} ctx={ctx} label="No embed code provided" />;
  }

  const rootStyle = d.removePadding ? { padding: 0, gap: 0, background: 'transparent' } : undefined;
  const height = HEIGHT_MAP[d.height as string] || 'auto';

  // Apply styling to the inner iframe
  const wrapperStyle: React.CSSProperties = { height };
  if (height !== 'auto') {
    wrapperStyle.display = 'block';
  }

  return (
    <div className={cls('root')} style={rootStyle}>
      <div 
        className={cls('wrapper')} 
        style={wrapperStyle}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
      />
      {c.caption && <div className={cls('caption')}>{c.caption}</div>}
    </div>
  );
}
