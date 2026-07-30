import React from 'react';
import { RenderIcon } from './icon-helper';
import { asArray, EmptyState, navProps, type WidgetRenderProps } from './shared';

/**
 * SOCIAL_ICONS — explicitly defined social media profile links.
 * Click analytics are automatically captured by CardAnalytics via `data-widget="SOCIAL_ICONS"`.
 */
export function SocialIconsRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;
  
  const demoProfiles = asArray<any>(c.profiles);
  const profiles = demoProfiles.length ? demoProfiles : asArray<any>(ctx.card?.socials || ctx.card?.socialLinks);

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
            {...navProps(profile.url, ctx.isEditing ?? false, '_blank')}
            aria-label={profile.platform}
          >
            <RenderIcon name={profile.platform} className={cls('icon')} />
            {d.showLabel !== false && (
              <span className={cls('label')}>{profile.platform}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
