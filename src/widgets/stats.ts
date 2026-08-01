import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'STATS',
  label: 'Stats',
  iconName: 'BarChart',
  group: 'business',
  description: 'A grid of numeric statistics or achievements.',
  contentVersion: 1,
  defaultLayout: {
    id: 'root',
    kind: 'element',
    tag: 'stack',
    style: {
      base: {
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
        tag: 'grid',
        style: {
          base: { display: 'grid', gap: '{space.4}', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' },
        },
        children: [
          {
            id: 'item',
            kind: 'element',
            tag: 'stack',
            repeat: { source: 'self', path: 'items' },
            style: {
              base: { display: 'flex', flexDirection: 'column', gap: '{space.1}', alignItems: 'center', textAlign: 'center' },
            },
            children: [
              {
                id: 'value',
                kind: 'element',
                tag: 'text',
                bind: { source: 'self', path: 'value' },
                style: {
                  base: {
                    fontSize: '{size.2xl}',
                    fontWeight: 700,
                    color: '{color.primary}',
                    lineHeight: 1,
                  },
                },
              },
              {
                id: 'label',
                kind: 'element',
                tag: 'text',
                bind: { source: 'self', path: 'label' },
                style: {
                  base: {
                    fontSize: '{size.sm}',
                    color: '{color.muted}',
                    fontWeight: 500,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'grid-2', label: '2 Columns' },
        { value: 'grid-3', label: '3 Columns' },
        { value: 'stack', label: 'Vertical Stack' },
      ],
    },
    {
      key: 'align', type: 'select', label: 'Alignment',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    },
    { key: 'showBorders', type: 'boolean', label: 'Show item borders/dividers' },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 60 },
    { key: 'description', type: 'textarea', label: 'Description', max: 200 },
    {
      key: 'items', type: 'repeater', label: 'Statistics', itemLabel: '{label}',
      fields: [
        { key: 'value', type: 'text', label: 'Value (e.g. 100+)', max: 20 },
        { key: 'label', type: 'text', label: 'Label', max: 50 },
      ]
    }
  ],

  defaultDesign: { layout: 'grid-2', align: 'center', showBorders: false },
  defaultContent: {
    title: '',
    description: '',
    items: [
      { value: '10K+', label: 'Happy Clients' },
      { value: '5', label: 'Years Active' },
      { value: '99%', label: 'Satisfaction' },
      { value: '24/7', label: 'Support' },
    ]
  }
};

export const previews = {
  empty: { title: '', description: '', items: [] },
  typical: meta.defaultContent,
  stress: { title: 'A'.repeat(60), description: '', items: Array(6).fill({ value: '9,999,999+', label: 'Very Long Stat Label That Wraps' }) }
};
