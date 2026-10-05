import type { WidgetModule } from '../types/widget';
import { carouselParts, carouselDefaultPartStyles } from './carousel-parts';

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
    { key: 'header', label: 'Header', kind: 'container' },
    { key: 'title', label: 'Title', kind: 'text' },
    { key: 'description', label: 'Description', kind: 'text' },
    { key: 'list', label: 'List', kind: 'list' },
    { key: 'item', label: 'Item', kind: 'container' },
    { key: 'question', label: 'Question', kind: 'button' },
    { key: 'chevron', label: 'Chevron', kind: 'icon' },
    { key: 'answer', label: 'Answer', kind: 'text' },
    ...carouselParts,
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
    { key: 'description', type: 'textarea', label: 'Description', max: 200 },
    { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },
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
    header: { base: { display: 'flex', flexDirection: 'column', gap: '{space.1}' } },
    description: {
      base: { fontSize: '{size.sm}', lineHeight: 1.55, color: '{color.muted}' },
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
    title: 'Frequently asked questions',
    description: '',
    items: [
      { question: 'What is your turnaround time?', answer: 'Most projects wrap in 2-3 weeks.' },
      { question: 'Do you offer ongoing support?', answer: 'Yes, retainer plans are available.' },
    ],
  },
  defaultLayout: {
    id: 'root',
    kind: 'element',
    tag: 'stack',
    name: 'Container',
    style: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.3}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' },
      },
    },
    children: [
      {
        id: 'header',
        kind: 'element',
        tag: 'stack',
        name: 'Header',
        style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.1}' } },
        children: [
          {
            id: 'title',
            kind: 'element',
            tag: 'heading',
            name: 'Title',
            props: { level: 3 },
            bind: { source: 'self', path: 'title' },
            hideIfEmpty: true,
            style: {
              base: { fontFamily: '{font.heading}', fontSize: '{size.lg}', fontWeight: 700, color: '{color.text}' },
            },
          },
          {
            id: 'description',
            kind: 'element',
            tag: 'text',
            name: 'Description',
            bind: { source: 'self', path: 'description' },
            hideIfEmpty: true,
            style: {
              base: { fontSize: '{size.sm}', lineHeight: 1.55, color: '{color.muted}' },
            },
          },
        ],
      },
      {
        id: 'list',
        kind: 'element',
        tag: 'stack',
        name: 'List',
        style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
        children: [
          {
            id: 'item',
            kind: 'element',
            tag: 'frame',
            name: 'Item',
            repeat: { source: 'self', path: 'items' },
            style: {
              base: {
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.md}' },
                overflow: 'hidden',
              },
            },
            children: [
              {
                id: 'question',
                kind: 'element',
                tag: 'text',
                name: 'Question',
                bind: { source: 'self', path: 'question' },
                style: {
                  base: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '{space.3}',
                    padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                    fontSize: '{size.base}',
                    fontWeight: 600,
                    color: '{color.text}',
                  },
                },
              },
              {
                id: 'answer',
                kind: 'element',
                tag: 'text',
                name: 'Answer',
                bind: { source: 'self', path: 'answer' },
                style: {
                  base: {
                    padding: { t: '0', r: '{space.4}', b: '{space.4}', l: '{space.4}' },
                    fontSize: '{size.sm}',
                    lineHeight: 1.6,
                    color: '{color.muted}',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
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
