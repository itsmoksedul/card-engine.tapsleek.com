import React from 'react';
import { asArray, EmptyState, type WidgetRenderProps } from './shared';

/**
 * SOCIAL_ICONS — explicitly defined social media profile links.
 * Click analytics are automatically captured by CardAnalytics via `data-widget="SOCIAL_ICONS"`.
 */
export function SocialIconsRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;
  
  const profiles = asArray<any>(c.profiles);

  if (!profiles.length) {
    return <EmptyState cls={cls} ctx={ctx} label="No social profiles" />;
  }

  // Handle alignment
  const justifyContent = d.layout === 'center' ? 'center' : d.layout === 'grid' ? 'space-between' : 'flex-start';

  return (
    <div className={cls('root')} data-layout={d.layout ?? 'center'} data-size={d.size ?? 'md'}>
      <div className={cls('list')} style={{ justifyContent }}>
        {profiles.map((profile, i) => (
          <a
            key={i}
            className={cls('item')}
            href={profile.url || '#'}
            target="_blank"
            rel="noreferrer"
            aria-label={profile.platform}
          >
            <span className={cls('icon')} data-icon={profile.platform} aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}
