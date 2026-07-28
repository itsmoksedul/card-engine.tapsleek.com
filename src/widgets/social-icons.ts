import type { WidgetModule } from '../types/widget';

const PLATFORMS = [
  'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 
  'tiktok', 'github', 'discord', 'twitch', 'website'
] as const;

export const meta: WidgetModule['meta'] = {
  type: 'SOCIAL_ICONS',
  label: 'Social Icons',
  iconName: 'Twitter',
  group: 'contact',
  description: 'A dedicated row or grid of social media icons.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'list', label: 'Icon List', kind: 'list' },
    { key: 'item', label: 'Icon Link', kind: 'button' },
    { key: 'icon', label: 'Icon Glyph', kind: 'icon' },
  ],
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'left', label: 'Row (Left aligned)' },
        { value: 'center', label: 'Row (Centered)' },
        { value: 'grid', label: 'Grid' },
      ],
    },
    {
      key: 'size', type: 'select', label: 'Icon Size',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ],
    }
  ],
  contentSchema: [
    {
      key: 'profiles', type: 'repeater', label: 'Social Profiles', itemLabel: '{platform}',
      fields: [
        {
          key: 'platform', type: 'select', label: 'Platform',
          options: PLATFORMS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))
        },
        { key: 'url', type: 'url', label: 'Profile URL' }
      ]
    }
  ],
  defaultPartStyles: {
    root: { base: { display: 'flex', width: '100%', padding: { t: '{space.2}', b: '{space.2}' } } },
    list: { base: { display: 'flex', flexWrap: 'wrap', gap: '{space.3}', alignItems: 'center' } },
    item: {
      base: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '40px', height: '40px',
        background: { kind: 'color', color: '{color.surface}' },
        color: '{color.text}',
        borderRadius: { all: '{radius.full}' },
        transition: { property: ['transform', 'background-color'], duration: 150, easing: 'ease' }
      },
      hover: { 
        transform: { translateY: '-2px' },
        background: { kind: 'color', color: '{color.border}' }
      }
    },
    icon: { base: { width: '20px', height: '20px' } }
  },
  defaultDesign: { layout: 'center', size: 'md' },
  defaultContent: {
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'instagram', url: 'https://instagram.com' }
    ]
  }
};

export const previews = {
  empty: { profiles: [] },
  typical: meta.defaultContent,
  stress: { profiles: Array(10).fill({ platform: 'github', url: '#' }) }
};
