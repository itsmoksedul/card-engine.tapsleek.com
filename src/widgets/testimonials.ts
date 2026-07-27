import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'TESTIMONIALS',
  label: 'Testimonials',
  iconName: 'Quote',
  group: 'business',
  description: 'Customer quotes with optional avatar and rating.',
  contentVersion: 2,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'title', label: 'Section title' },
    { key: 'list', label: 'List' },
    { key: 'item', label: 'Testimonial card' },
    { key: 'mark', label: 'Quote mark' },
    { key: 'quote', label: 'Quote text' },
    { key: 'stars', label: 'Rating stars' },
    { key: 'caption', label: 'Author row' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'author', label: 'Author name' },
    { key: 'role', label: 'Author role' },
  ],
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'stack', label: 'Stacked' },
        { value: 'carousel', label: 'Carousel' },
        { value: 'grid-2', label: '2 columns' },
      ],
    },
    { key: 'showAvatar', type: 'boolean', label: 'Show avatar' },
    { key: 'showRating', type: 'boolean', label: 'Show star rating' },
    {
      key: 'quoteMark', type: 'select', label: 'Quote mark',
      options: [
        { value: 'none', label: 'None' },
        { value: 'icon', label: 'Small icon' },
        { value: 'large', label: 'Large decorative' },
      ],
    },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Section title', max: 60 },
    {
      key: 'items', type: 'repeater', label: 'Testimonials', min: 1, max: 20, itemLabel: '{author}',
      fields: [
        { key: 'quote', type: 'textarea', label: 'Quote', required: true, max: 300 },
        { key: 'author', type: 'text', label: 'Name', required: true, max: 60 },
        { key: 'role', type: 'text', label: 'Role / company', max: 60 },
        { key: 'avatar', type: 'image', label: 'Photo', ratio: '1/1', maxMB: 2 },
        { key: 'rating', type: 'number', label: 'Rating', min: 1, max: 5, step: 1 },
      ],
    },
  ],
  defaultDesign: { layout: 'stack', showAvatar: true, showRating: true, quoteMark: 'icon' },
  defaultContent: {
    title: 'What clients say',
    items: [
      {
        quote: 'Delivered exactly what we needed, ahead of schedule.',
        author: 'Sarah Ahmed',
        role: 'CEO, Northwind',
        avatar: '',
        rating: 5,
      },
    ],
  },
};

/** v1 → v2: `text`/`name` renamed to `quote`/`author`. */
export const migrations = {
  2: (c: any) => ({
    title: c?.title ?? '',
    items: Array.isArray(c?.items)
      ? c.items.map((i: any) => ({
          quote: i?.quote ?? i?.text ?? '',
          author: i?.author ?? i?.name ?? '',
          role: i?.role ?? '',
          avatar: i?.avatar ?? '',
          rating: typeof i?.rating === 'number' ? i.rating : undefined,
        }))
      : [],
  }),
};

export const previews = {
  empty: { title: '', items: [] },
  typical: meta.defaultContent,
  stress: {
    title: 'A'.repeat(60),
    items: Array.from({ length: 20 }, () => ({
      quote: 'Q'.repeat(300), author: 'N'.repeat(60), role: 'R'.repeat(60), avatar: '', rating: 5,
    })),
  },
};
