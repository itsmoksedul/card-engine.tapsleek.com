import React from 'react';
import { EmptyState, str, type WidgetRenderProps } from './shared';

/**
 * APPOINTMENT — links into the real booking flow.
 *
 * The profile is resolved by the backend before the payload leaves the API
 * (WidgetMeta.references), so this stays pure and synchronous.
 */
export function AppointmentRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, any>;
  const d = (design ?? {}) as Record<string, any>;
  const profile = c.profile as { slug?: string; name?: string; duration?: number } | undefined;

  if (!profile?.slug) {
    return <EmptyState cls={cls} ctx={ctx} label="Pick an appointment profile" />;
  }

  return (
    <div className={cls('root')} data-mode={d.mode ?? 'button'}>
      {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
      {str(c.description) && <p className={cls('description')}>{str(c.description)}</p>}
      {d.showDuration !== false && profile.duration && (
        <div className={cls('meta')}>{profile.duration} min</div>
      )}
      <a
        className={cls('button')}
        href={`/appt/${profile.slug}`}
        onClick={() => ctx.track({ type: 'WIDGET_CLICK', part: 'button' })}
      >
        {str(c.buttonLabel) || 'Choose a time'}
      </a>
    </div>
  );
}
