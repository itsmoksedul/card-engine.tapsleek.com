import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'TEAM',
  label: 'Team',
  iconName: 'Users',
  group: 'business',
  description: 'A grid of team members with photos and roles.',
  contentVersion: 1,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'heading', label: 'Heading', kind: 'text' },
    { key: 'list', label: 'Grid/List', kind: 'list' },
    { key: 'item', label: 'Team Member', kind: 'container' },
    { key: 'avatar', label: 'Avatar Image', kind: 'image' },
    { key: 'content', label: 'Text Wrapper', kind: 'container' },
    { key: 'name', label: 'Name', kind: 'text' },
    { key: 'role', label: 'Role / Title', kind: 'text' },
    { key: 'bio', label: 'Bio', kind: 'text' },
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
      key: 'align', type: 'select', label: 'Text Alignment',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
      ],
    },
    {
      key: 'avatarShape', type: 'select', label: 'Avatar Shape',
      options: [
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square (Rounded)' },
      ],
    },
  ],
  contentSchema: [
    { key: 'heading', type: 'text', label: 'Heading', max: 60 },
    {
      key: 'items', type: 'repeater', label: 'Team Members', itemLabel: '{name}',
      fields: [
        { key: 'image', type: 'image', label: 'Photo' },
        { key: 'name', type: 'text', label: 'Name', max: 50 },
        { key: 'role', type: 'text', label: 'Role/Title', max: 50 },
        { key: 'bio', type: 'text', label: 'Bio', max: 150 },
      ]
    }
  ],
  defaultPartStyles: {
    root: { 
      base: { 
        display: 'flex', 
        flexDirection: 'column',
        gap: '{space.4}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' }
      } 
    },
    heading: {
      base: {
        fontFamily: '{font.heading}',
        fontSize: '{size.lg}',
        fontWeight: 700,
        color: '{color.text}',
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
        gap: '{space.3}',
        padding: { all: '{space.3}' }
      } 
    },
    avatar: {
      base: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: { all: '{radius.full}' } // default circle
      }
    },
    content: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.1}'
      }
    },
    name: {
      base: {
        fontSize: '{size.base}',
        fontWeight: 600,
        color: '{color.text}'
      }
    },
    role: {
      base: {
        fontSize: '{size.sm}',
        fontWeight: 500,
        color: '{color.primary}'
      }
    },
    bio: {
      base: {
        fontSize: '{size.sm}',
        color: '{color.muted}',
        lineHeight: 1.4
      }
    }
  },
  defaultDesign: { layout: 'grid-2', align: 'center', avatarShape: 'circle' },
  defaultContent: {
    heading: 'Meet the Team',
    items: [
      { name: 'Alice Smith', role: 'Founder & CEO', bio: '10+ years scaling tech startups.' },
      { name: 'Bob Jones', role: 'Head of Design', bio: 'Obsessed with typography.' },
    ]
  }
};

export const previews = {
  empty: { heading: '', items: [] },
  typical: meta.defaultContent,
  stress: { heading: 'A'.repeat(60), items: Array(6).fill({ name: 'A'.repeat(50), role: 'A'.repeat(50), bio: 'A'.repeat(150) }) }
};
