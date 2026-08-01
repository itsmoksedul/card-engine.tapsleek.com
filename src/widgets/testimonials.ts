import type { WidgetModule } from '../types/widget';
import { carouselParts, carouselDefaultPartStyles, createCarouselLayout, getCarouselDesignSchema } from './carousel-parts';

export const meta: WidgetModule['meta'] = {
  type: 'TESTIMONIALS',
  label: 'Testimonials',
  iconName: 'Quote',
  group: 'business',
  description: 'Customer quotes with optional avatar and rating.',
  contentVersion: 2,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'header', label: 'Header', kind: 'container' },
    { key: 'title', label: 'Section title', kind: 'text' },
    { key: 'description', label: 'Section description', kind: 'text' },
    { key: 'list', label: 'List', kind: 'list' },
    { key: 'item', label: 'Testimonial card', kind: 'container' },
    { key: 'mark', label: 'Quote mark', kind: 'icon' },
    { key: 'quote', label: 'Quote text', kind: 'text' },
    { key: 'stars', label: 'Rating stars', kind: 'list' },
    { key: 'caption', label: 'Author row', kind: 'container' },
    { key: 'avatar', label: 'Avatar', kind: 'image' },
    { key: 'author', label: 'Author name', kind: 'text' },
    { key: 'role', label: 'Role', kind: 'text' },
    ...carouselParts,
  ],
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'stack', label: 'Stack' },
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
    ...getCarouselDesignSchema(),
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 60 },
    { key: 'description', type: 'textarea', label: 'Description', max: 200 },
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
  defaultPartStyles: {
    root: {
      base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' },
    },
    header: { base: { display: 'flex', flexDirection: 'column', gap: '{space.1}' } },
    title: {
      base: {
        fontFamily: '{font.heading}',
        fontSize: '{size.lg}',
        fontWeight: 700,
        color: '{color.text}',
      },
    },
    description: {
      base: { fontSize: '{size.sm}', lineHeight: 1.55, color: '{color.muted}' },
    },
    list: { base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' } },
    item: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.2}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        border: { width: '1px', style: 'solid', color: '{color.border}' },
        borderRadius: { all: '{radius.lg}' },
      },
    },
    mark: {
      base: { fontSize: '{size.2xl}', lineHeight: 1, color: '{color.primary}', opacity: 0.35 },
    },
    quote: {
      base: {
        fontSize: '{size.base}',
        fontStyle: 'italic',
        lineHeight: 1.6,
        color: '{color.text}',
      },
    },
    stars: {
      base: { display: 'flex', gap: '{space.1}', color: '{color.primary}' },
    },
    caption: {
      base: {
        display: 'flex',
        alignItems: 'center',
        gap: '{space.2}',
        margin: { t: '{space.1}' },
      },
    },
    avatar: {
      base: {
        width: '36px',
        height: '36px',
        flexShrink: 0,
        objectFit: 'cover',
        borderRadius: { all: '{radius.full}' },
      },
    },
    author: {
      base: { fontSize: '{size.sm}', fontWeight: 600, color: '{color.text}' },
    },
    role: { base: { fontSize: '{size.xs}', color: '{color.muted}' } },
    ...carouselDefaultPartStyles,
  },
  defaultDesign: { layout: 'stack', showAvatar: true, showRating: true, quoteMark: 'icon', useCarousel: false, showArrows: true, showDots: true },
  defaultContent: {
    title: 'What clients say',
    description: '',
    items: [
      { author: 'Jane Doe', role: 'CEO, Acme Corp', quote: 'Tapsleek made connecting with clients seamless and beautiful.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', rating: 5 },
      { author: 'John Smith', role: 'Founder, Startup', quote: 'Highly recommended for any modern professional.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', rating: 5 },
    ],
  },
  defaultLayout: {
    id: 'root',
    kind: 'element',
    tag: 'stack',
    name: 'Container',
    style: {
      base: { display: 'flex', flexDirection: 'column', gap: '{space.3}', width: '100%' },
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
            name: 'Section title',
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
        visibleIf: { key: 'useCarousel', equals: false },
        style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' } },
        children: [
          {
            id: 'item',
            kind: 'element',
            tag: 'frame',
            name: 'Testimonial card',
            repeat: { source: 'self', path: 'items' },
            style: {
              base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.2}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.md}' },
              },
            },
            children: [
              {
                id: 'quote',
                kind: 'element',
                tag: 'text',
                name: 'Quote text',
                bind: { source: 'self', path: 'quote' },
                style: {
                  base: { fontSize: '{size.sm}', lineHeight: 1.6, color: '{color.text}', fontStyle: 'italic' },
                },
              },
              {
                id: 'caption',
                kind: 'element',
                tag: 'stack',
                name: 'Author row',
                style: { base: { display: 'flex', alignItems: 'center', gap: '{space.2}', margin: { t: '{space.1}' } } },
                children: [
                  {
                    id: 'avatar',
                    kind: 'element',
                    tag: 'image',
                    name: 'Avatar',
                    bind: { source: 'self', path: 'avatar' },
                    hideIfEmpty: true,
                    style: {
                      base: { width: '32px', height: '32px', borderRadius: { all: '{radius.full}' }, objectFit: 'cover' },
                    },
                  },
                  {
                    id: 'author',
                    kind: 'element',
                    tag: 'text',
                    name: 'Author name',
                    bind: { source: 'self', path: 'author' },
                    style: { base: { fontSize: '{size.xs}', fontWeight: 600, color: '{color.text}' } },
                  },
                  {
                    id: 'role',
                    kind: 'element',
                    tag: 'text',
                    name: 'Author role',
                    bind: { source: 'self', path: 'role' },
                    hideIfEmpty: true,
                    style: { base: { fontSize: '{size.xs}', color: '{color.muted}' } },
                  },
                ],
              },
            ],
          },
        ],
      },
      createCarouselLayout(
        {
          id: 'c_item',
          kind: 'element',
          tag: 'frame',
          name: 'Testimonial card',
          style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}', padding: { all: '{space.4}' }, background: { kind: 'color', color: '{color.surface}' }, border: { width: '1px', style: 'solid', color: '{color.border}' }, borderRadius: { all: '{radius.md}' } } },
          children: [
            { id: 'c_quote', kind: 'element', tag: 'text', name: 'Quote text', bind: { source: 'self', path: 'quote' }, style: { base: { fontSize: '{size.sm}', lineHeight: 1.6, color: '{color.text}', fontStyle: 'italic' } } },
            {
              id: 'c_caption',
              kind: 'element',
              tag: 'stack',
              name: 'Author row',
              style: { base: { display: 'flex', alignItems: 'center', gap: '{space.2}', margin: { t: '{space.1}' } } },
              children: [
                { id: 'c_avatar', kind: 'element', tag: 'image', name: 'Avatar', bind: { source: 'self', path: 'avatar' }, hideIfEmpty: true, style: { base: { width: '32px', height: '32px', borderRadius: { all: '{radius.full}' }, objectFit: 'cover' } } },
                { id: 'c_author', kind: 'element', tag: 'text', name: 'Author name', bind: { source: 'self', path: 'author' }, style: { base: { fontSize: '{size.xs}', fontWeight: 600, color: '{color.text}' } } },
                { id: 'c_role', kind: 'element', tag: 'text', name: 'Author role', bind: { source: 'self', path: 'role' }, hideIfEmpty: true, style: { base: { fontSize: '{size.xs}', color: '{color.muted}' } } },
              ]
            }
          ]
        },
        { itemsPath: "items", dotsKey: "showDots" }
      ),
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
