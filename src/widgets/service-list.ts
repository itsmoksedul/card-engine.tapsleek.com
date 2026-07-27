/**
 * SERVICE_LIST — the reference implementation of a content widget.
 *
 * Shows the whole pattern: a section header, a repeater of items, design knobs
 * the admin locks, and `layout` typically unlocked to the user via
 * `WidgetNode.userOptions` so they can pick list / grid / carousel without
 * being able to touch anything else.
 */
import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'SERVICE_LIST',
  label: 'Services',
  iconName: 'LayoutGrid',
  group: 'content',
  description: 'A titled list of services, products or features.',
  contentVersion: 2,
  interactive: true, // carousel layout needs client JS
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'header', label: 'Header' },
    { key: 'title', label: 'Section title' },
    { key: 'description', label: 'Section description' },
    { key: 'list', label: 'List' },
    { key: 'item', label: 'Item card' },
    { key: 'itemMedia', label: 'Item image', visibleIf: { key: 'showMedia', equals: true } },
    { key: 'itemTitle', label: 'Item title' },
    { key: 'itemDesc', label: 'Item description', visibleIf: { key: 'showDesc', equals: true } },
    { key: 'itemPrice', label: 'Item price' },
    { key: 'itemLink', label: 'Item link' },
  ],
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'list', label: 'List' },
        { value: 'grid-2', label: '2 columns' },
        { value: 'grid-3', label: '3 columns' },
        { value: 'carousel', label: 'Carousel' },
      ],
    },
    { key: 'showMedia', type: 'boolean', label: 'Show images' },
    {
      key: 'mediaRatio', type: 'select', label: 'Image ratio',
      options: [
        { value: '1/1', label: 'Square' },
        { value: '4/3', label: '4:3' },
        { value: '16/9', label: '16:9' },
      ],
      visibleIf: { key: 'showMedia', equals: true },
    },
    { key: 'showDesc', type: 'boolean', label: 'Show descriptions' },
    { key: 'showPrice', type: 'boolean', label: 'Show price' },
    { key: 'autoplay', type: 'boolean', label: 'Autoplay', visibleIf: { key: 'layout', equals: 'carousel' } },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Section title', max: 60 },
    { key: 'description', type: 'textarea', label: 'Section description', max: 240 },
    {
      key: 'items', type: 'repeater', label: 'Services', min: 1, max: 24, itemLabel: '{name}',
      fields: [
        { key: 'image', type: 'image', label: 'Image', ratio: '4/3', maxMB: 3 },
        { key: 'name', type: 'text', label: 'Name', required: true, max: 60 },
        { key: 'description', type: 'textarea', label: 'Description', max: 200 },
        { key: 'price', type: 'text', label: 'Price', max: 24 },
        { key: 'link', type: 'url', label: 'Link' },
      ],
    },
  ],
  defaultDesign: {
    layout: 'grid-2',
    showMedia: true,
    mediaRatio: '4/3',
    showDesc: true,
    showPrice: false,
    autoplay: false,
  },
  defaultContent: {
    title: 'Our Services',
    description: '',
    items: [
      { name: 'Brand Design', description: 'Identity systems that scale.', image: '', price: '', link: '' },
      { name: 'Web Development', description: 'Fast, accessible websites.', image: '', price: '', link: '' },
    ],
  },
};

/**
 * v1 → v2: `url` was renamed to `link`, and the section header moved from a
 * bare string into `title` + `description`. Runs lazily on read; nothing is
 * rewritten in bulk.
 */
export const migrations = {
  2: (c: any) => ({
    title: c?.title ?? c?.heading ?? '',
    description: c?.description ?? c?.subtitle ?? '',
    items: Array.isArray(c?.items)
      ? c.items.map((i: any) => ({
          image: i?.image ?? '',
          name: i?.name ?? i?.label ?? '',
          description: i?.description ?? i?.desc ?? '',
          price: i?.price ?? '',
          link: i?.link ?? i?.url ?? '',
        }))
      : [],
  }),
};

export const previews = {
  empty: { title: '', description: '', items: [] },
  typical: meta.defaultContent,
  stress: {
    title: 'A'.repeat(60),
    description: 'B'.repeat(240),
    items: Array.from({ length: 24 }, (_, i) => ({
      image: '',
      name: `Service with a very long name number ${i + 1}`,
      description: 'C'.repeat(200),
      price: '৳ 12,500',
      link: 'https://example.com',
    })),
  },
};
