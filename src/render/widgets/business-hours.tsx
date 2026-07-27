import React from 'react';
import { asArray, EmptyState, str, type WidgetRenderProps } from './shared';

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_INDEX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function BusinessHoursRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const days = asArray<Record<string, unknown>>(c.days);

  if (!days.length) return <EmptyState cls={cls} ctx={ctx} label="No hours set" />;

  // Computed on the client only. Doing this during SSR would bake one
  // visitor's "today" into the ISR-cached HTML for everyone.
  const today = typeof window === 'undefined' ? null : DAY_INDEX[new Date().getDay()];

  return (
    <div className={cls('root')}>
      {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
      <div className={cls('list')}>
        {days.map((day) => {
          const key = str(day.day);
          const closed = Boolean(day.closed);
          return (
            <div
              key={key}
              className={cls('row')}
              data-today={d.highlightToday !== false && today === key ? 'true' : undefined}
              data-closed={closed ? 'true' : undefined}
            >
              <span className={cls('day')}>{DAY_LABELS[key] ?? key}</span>
              <span className={cls('time')}>
                {closed
                  ? 'Closed'
                  : `${formatTime(str(day.open), d.timeFormat)} – ${formatTime(str(day.close), d.timeFormat)}`}
              </span>
            </div>
          );
        })}
      </div>
      {str(c.note) && <p className={cls('note')}>{str(c.note)}</p>}
    </div>
  );
}

function formatTime(value: string, format?: string): string {
  if (!value) return '';
  if (format === '24h') return value;
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h)) return value;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`;
}
