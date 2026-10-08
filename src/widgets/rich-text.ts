import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'RICH_TEXT',
  label: 'Text',
  iconName: 'Text',
  group: 'content',
  description: 'A heading and a block of formatted text.',
  contentVersion: 1,
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 80 },
    { key: 'body', type: 'richtext', label: 'Text', max: 4000, toolbar: ['b', 'i', 'link', 'ul', 'ol'] },
  ],
  defaultDesign: { showTitle: true, align: 'left' },
  defaultContent: { title: 'About', body: 'Tell people what you do.' },
  defaultLayout: {
    id: 'root',
    kind: 'element',
    tag: 'stack',
    style: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.2}',
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' },
      },
    },
    children: [
      {
        id: 'title',
        kind: 'element',
        tag: 'heading',
        props: { level: 3 },
        bind: { source: 'self', path: 'title' },
        hideIfEmpty: true,
        style: {
          base: {
            fontFamily: '{font.heading}',
            fontSize: '{size.lg}',
            fontWeight: 700,
            color: '{color.text}',
          },
        },
      },
      {
        id: 'body',
        kind: 'element',
        tag: 'richtext',
        bind: { source: 'self', path: 'body' },
        style: {
          base: { fontSize: '{size.base}', lineHeight: 1.6, color: '{color.muted}', whiteSpace: 'pre-wrap' },
        },
      }
    ]
  },
};

export const previews = {
  empty: { title: '', body: '' },
  typical: meta.defaultContent,
  stress: { title: 'A'.repeat(80), body: `<p>${'Lorem ipsum dolor sit amet. '.repeat(120)}</p>` },
};
