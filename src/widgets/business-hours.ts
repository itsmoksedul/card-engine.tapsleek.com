import type { WidgetModule } from '../types/widget';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export const meta: WidgetModule['meta'] = {
  type: 'BUSINESS_HOURS',
  label: 'Opening Hours',
  iconName: 'Clock',
  group: 'business',
  description: 'Weekly opening hours with an optional open/closed badge.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'title', label: 'Title' },
    { key: 'badge', label: 'Open / closed badge' },
    { key: 'list', label: 'List' },
    { key: 'row', label: 'Day row' },
    { key: 'day', label: 'Day name' },
    { key: 'time', label: 'Hours' },
    { key: 'note', label: 'Note' },
  ],
  designSchema: [
    { key: 'showBadge', type: 'boolean', label: 'Show open / closed badge' },
    { key: 'highlightToday', type: 'boolean', label: 'Highlight today' },
    {
      key: 'timeFormat', type: 'select', label: 'Time format',
      options: [
        { value: '12h', label: '12-hour' },
        { value: '24h', label: '24-hour' },
      ],
    },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 60 },
    { key: 'timezone', type: 'text', label: 'Timezone', max: 40, hint: 'e.g. Asia/Dhaka' },
    {
      key: 'days', type: 'repeater', label: 'Days', min: 7, max: 7, itemLabel: '{day}',
      fields: [
        {
          key: 'day', type: 'select', label: 'Day',
          options: DAYS.map((d) => ({ value: d, label: DAY_LABELS[d] })),
        },
        { key: 'closed', type: 'boolean', label: 'Closed' },
        { key: 'open', type: 'time', label: 'Opens', visibleIf: { key: 'closed', equals: false } },
        { key: 'close', type: 'time', label: 'Closes', visibleIf: { key: 'closed', equals: false } },
      ],
    },
    { key: 'note', type: 'text', label: 'Note', max: 120 },
  ],
  defaultPartStyles: {
    root: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.3}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' },
      },
    },
    title: {
      base: {
        fontFamily: '{font.heading}',
        fontSize: '{size.lg}',
        fontWeight: 700,
        color: '{color.text}',
      },
    },
    badge: {
      base: {
        alignSelf: 'flex-start',
        padding: { t: '{space.1}', r: '{space.3}', b: '{space.1}', l: '{space.3}' },
        background: { kind: 'color', color: '{color.bg}' },
        color: '{color.primary}',
        borderRadius: { all: '{radius.full}' },
        fontSize: '{size.xs}',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
      },
    },
    list: { base: { display: 'flex', flexDirection: 'column' } },
    row: {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '{space.4}',
        padding: { t: '{space.2}', b: '{space.2}' },
        border: {
          sides: { b: { width: '1px', style: 'solid', color: '{color.border}' } },
        },
        fontSize: '{size.sm}',
      },
    },
    day: { base: { color: '{color.muted}', fontWeight: 500 } },
    time: { base: { color: '{color.text}', fontWeight: 600 } },
    note: {
      base: { fontSize: '{size.xs}', color: '{color.muted}', lineHeight: 1.5 },
    },
  },
  defaultDesign: { showBadge: true, highlightToday: true, timeFormat: '12h' },
  defaultContent: {
    title: 'Opening hours',
    timezone: 'Asia/Dhaka',
    days: DAYS.map((d) => ({
      day: d,
      closed: d === 'fri',
      open: d === 'fri' ? '' : '10:00',
      close: d === 'fri' ? '' : '18:00',
    })),
    note: '',
  },
};

export const previews = {
  empty: { title: '', timezone: '', days: [], note: '' },
  typical: meta.defaultContent,
  stress: { ...meta.defaultContent, title: 'A'.repeat(60), note: 'N'.repeat(120) },
};
