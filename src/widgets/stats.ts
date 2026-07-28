import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'STATS',
  label: 'Stats',
  iconName: 'BarChart',
  group: 'business',
  description: 'A grid of numeric statistics or achievements.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'list', label: 'Grid/List', kind: 'list' },
    { key: 'item', label: 'Stat Item', kind: 'container' },
    { key: 'value', label: 'Value (e.g. 10K+)', kind: 'text' },
    { key: 'label', label: 'Label', kind: 'text' },
  ],
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
    {
      key: 'items', type: 'repeater', label: 'Statistics', itemLabel: '{label}',
      fields: [
        { key: 'value', type: 'text', label: 'Value (e.g. 100+)', max: 20 },
        { key: 'label', type: 'text', label: 'Label', max: 50 },
      ]
    }
  ],
  defaultPartStyles: {
    root: { 
      base: { 
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' }
      } 
    },
    list: { 
      base: { 
        display: 'grid', 
        gap: '{space.4}' 
      } 
    },
    item: { 
      base: { 
        display: 'flex', 
        flexDirection: 'column',
        gap: '{space.1}'
      } 
    },
    value: {
      base: {
        fontSize: '{size.2xl}',
        fontWeight: 700,
        color: '{color.primary}',
        lineHeight: 1
      }
    },
    label: {
      base: {
        fontSize: '{size.sm}',
        color: '{color.muted}',
        fontWeight: 500
      }
    }
  },
  defaultDesign: { layout: 'grid-2', align: 'center', showBorders: false },
  defaultContent: {
    items: [
      { value: '10K+', label: 'Happy Clients' },
      { value: '5', label: 'Years Active' },
      { value: '99%', label: 'Satisfaction' },
      { value: '24/7', label: 'Support' },
    ]
  }
};

export const previews = {
  empty: { items: [] },
  typical: meta.defaultContent,
  stress: { items: Array(6).fill({ value: '9,999,999+', label: 'Very Long Stat Label That Wraps' }) }
};
