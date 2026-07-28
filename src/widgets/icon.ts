import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'ICON',
  label: 'Icon',
  iconName: 'Smile',
  group: 'utility',
  description: 'A single icon, optionally linked.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'icon', label: 'Icon', kind: 'icon' },
  ],
  designSchema: [
    {
      key: 'align', type: 'select', label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
  ],
  contentSchema: [
    { key: 'icon', type: 'icon', label: 'Icon', set: 'lucide' },
    { key: 'link', type: 'url', label: 'Link' },
  ],
  defaultPartStyles: {
    root: { base: { display: 'flex', justifyContent: 'center' } },
    icon: {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '{size.2xl}',
        color: '{color.primary}',
      },
    },
  },
  defaultDesign: { align: 'center' },
  defaultContent: { icon: 'Star', link: '' },
};

export const previews = {
  empty: { icon: '' },
  typical: meta.defaultContent,
  stress: { icon: 'Star', link: 'https://example.com/' + 'x'.repeat(180) },
};
