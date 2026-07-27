import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'FAQ',
  label: 'FAQ',
  iconName: 'MessageCircleQuestion',
  group: 'content',
  description: 'Expandable question-and-answer list.',
  contentVersion: 1,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'title', label: 'Title' },
    { key: 'list', label: 'List' },
    { key: 'item', label: 'Item' },
    { key: 'question', label: 'Question' },
    { key: 'chevron', label: 'Chevron' },
    { key: 'answer', label: 'Answer' },
  ],
  designSchema: [
    { key: 'openFirst', type: 'boolean', label: 'Open the first item' },
    { key: 'singleOpen', type: 'boolean', label: 'Only one open at a time' },
    {
      key: 'marker', type: 'select', label: 'Marker',
      options: [
        { value: 'chevron', label: 'Chevron' },
        { value: 'plus', label: 'Plus / minus' },
        { value: 'none', label: 'None' },
      ],
    },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 60 },
    {
      key: 'items', type: 'repeater', label: 'Questions', min: 1, max: 30, itemLabel: '{question}',
      fields: [
        { key: 'question', type: 'text', label: 'Question', required: true, max: 160 },
        { key: 'answer', type: 'textarea', label: 'Answer', required: true, max: 1200 },
      ],
    },
  ],
  defaultDesign: { openFirst: true, singleOpen: true, marker: 'chevron' },
  defaultContent: {
    title: 'Frequently asked',
    items: [{ question: 'How do I get started?', answer: 'Send a message and we will get back to you.' }],
  },
};

export const previews = {
  empty: { title: '', items: [] },
  typical: meta.defaultContent,
  stress: {
    title: 'A'.repeat(60),
    items: Array.from({ length: 30 }, () => ({ question: 'Q'.repeat(160), answer: 'A'.repeat(1200) })),
  },
};
