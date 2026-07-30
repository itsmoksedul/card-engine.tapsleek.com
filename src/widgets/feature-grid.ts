import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'FEATURE_GRID',
  label: 'Feature Grid',
  iconName: 'LayoutGrid',
  group: 'business',
  description: 'A grid highlighting key features or services with icons.',
  deprecated: {
    since: '2.1',
    note: 'Feature Grid has been deprecated. Use Service List or custom blocks instead.',
  },
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
        id: 'list',
        kind: 'element',
        tag: 'grid',
        style: {
          base: { display: 'grid', gap: '{space.4}', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' },
        },
        children: [
          {
            id: 'item',
            kind: 'element',
            tag: 'stack',
            repeat: { source: 'self', path: 'items' },
            style: {
              base: { display: 'flex', flexDirection: 'column', gap: '{space.2}', alignItems: 'flex-start' },
            },
            children: [
              {
                id: 'iconBox',
                kind: 'element',
                tag: 'stack',
                style: {
                  base: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: { all: '{radius.md}' },
                    background: { kind: 'color', color: '{color.primary}' },
                    color: '{color.surface}',
                  },
                },
                children: [
                  {
                    id: 'icon',
                    kind: 'element',
                    tag: 'icon',
                    bind: { source: 'self', path: 'icon' },
                    style: { base: { width: '20px', height: '20px' } },
                  },
                ],
              },
              {
                id: 'title',
                kind: 'element',
                tag: 'text',
                bind: { source: 'self', path: 'title' },
                style: {
                  base: {
                    fontSize: '{size.base}',
                    fontWeight: 600,
                    color: '{color.text}',
                  },
                },
              },
              {
                id: 'description',
                kind: 'element',
                tag: 'text',
                bind: { source: 'self', path: 'description' },
                style: {
                  base: {
                    fontSize: '{size.sm}',
                    color: '{color.muted}',
                    lineHeight: 1.5,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  designSchema: [],
  defaultDesign: {},
  contentSchema: [
    {
      key: 'items',
      type: 'repeater',
      label: 'Features',
      itemLabel: '{title}',
      fields: [
        { key: 'icon', type: 'icon', label: 'Icon' },
        { key: 'title', type: 'text', label: 'Title', max: 50 },
        { key: 'description', type: 'textarea', label: 'Description', max: 150 },
      ],
    },
  ],
  defaultContent: {
    items: [
      { icon: 'Zap', title: 'Fast', description: 'Lightning fast performance.' },
      { icon: 'Shield', title: 'Secure', description: 'Enterprise grade security.' },
    ],
  },
};

export const previews = {
  empty: { items: [] },
  typical: meta.defaultContent,
  stress: { items: Array(6).fill({ icon: 'Star', title: 'Very Long Feature Title', description: 'A long description that might wrap to multiple lines and cause layout issues.' }) },
};
