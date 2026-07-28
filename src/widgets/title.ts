import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'TITLE',
  label: 'Title',
  iconName: 'Heading',
  group: 'content',
  description: 'A standalone heading.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'text', label: 'Heading', kind: 'text' },
  ],
  designSchema: [
    {
      key: 'level', type: 'select', label: 'Level',
      options: [
        { value: 'h1', label: 'H1' },
        { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' },
      ],
    },
    {
      key: 'align', type: 'select', label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
  ],
  contentSchema: [{ key: 'text', type: 'text', label: 'Text', required: true, max: 120 }],
  defaultPartStyles: {
    root: { base: { display: 'flex', flexDirection: 'column' } },
    text: {
      base: {
        fontFamily: '{font.heading}',
        fontSize: '{size.xl}',
        fontWeight: 700,
        color: '{color.text}',
      },
    },
  },
  defaultDesign: { level: 'h2', align: 'left' },
  defaultContent: { text: 'Section title' },
};

export const previews = {
  empty: { text: '' },
  typical: meta.defaultContent,
  stress: { text: 'A'.repeat(120) },
};
