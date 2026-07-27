import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'RICH_TEXT',
  label: 'Text',
  iconName: 'Text',
  group: 'content',
  description: 'A heading and a block of formatted text.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'title', label: 'Title' },
    { key: 'body', label: 'Body' },
  ],
  designSchema: [
    { key: 'showTitle', type: 'boolean', label: 'Show title' },
    {
      key: 'align', type: 'select', label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
      ],
    },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 80 },
    { key: 'body', type: 'richtext', label: 'Text', max: 4000, toolbar: ['b', 'i', 'link', 'ul', 'ol'] },
  ],
  defaultPartStyles: {
    root: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.2}',
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
    body: {
      base: { fontSize: '{size.base}', lineHeight: 1.6, color: '{color.muted}' },
    },
  },
  defaultDesign: { showTitle: true, align: 'left' },
  defaultContent: { title: 'About', body: '<p>Tell people what you do.</p>' },
};

export const previews = {
  empty: { title: '', body: '' },
  typical: meta.defaultContent,
  stress: { title: 'A'.repeat(80), body: `<p>${'Lorem ipsum dolor sit amet. '.repeat(120)}</p>` },
};
