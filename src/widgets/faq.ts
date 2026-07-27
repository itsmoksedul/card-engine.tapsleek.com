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
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'title', label: 'Title', kind: 'text' },
    { key: 'list', label: 'List', kind: 'list' },
    { key: 'item', label: 'Item', kind: 'container' },
    { key: 'question', label: 'Question', kind: 'button' },
    { key: 'chevron', label: 'Chevron', kind: 'icon' },
    { key: 'answer', label: 'Answer', kind: 'text' },
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
    list: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
    item: {
      base: {
        border: { width: '1px', style: 'solid', color: '{color.border}' },
        borderRadius: { all: '{radius.md}' },
        overflow: 'hidden',
      },
    },
    question: {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '{space.3}',
        padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
        fontSize: '{size.base}',
        fontWeight: 600,
        color: '{color.text}',
        cursor: 'pointer',
        userSelect: 'none',
      },
      hover: { background: { kind: 'color', color: '{color.bg}' } },
    },
    chevron: {
      base: {
        display: 'flex',
        flexShrink: 0,
        width: '16px',
        height: '16px',
        color: '{color.muted}',
        transition: { property: ['transform'], duration: 150, easing: 'ease' },
      },
    },
    answer: {
      base: {
        padding: { t: '0', r: '{space.4}', b: '{space.4}', l: '{space.4}' },
        fontSize: '{size.sm}',
        lineHeight: 1.6,
        color: '{color.muted}',
      },
    },
  },
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
