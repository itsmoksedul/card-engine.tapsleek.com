import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'PRICE_LIST',
  label: 'Price List',
  iconName: 'List',
  group: 'business',
  description: 'A menu or pricing list with items and costs.',
  contentVersion: 1,
  defaultLayout: {
    id: 'root',
    kind: 'element',
    tag: 'stack',
    style: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.4}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' },
      },
    },
    children: [
      {
        id: 'heading',
        kind: 'element',
        tag: 'heading',
        props: { level: 3 },
        hideIfEmpty: true,
        bind: { source: 'self', path: 'heading' },
        style: {
          base: {
            fontFamily: '{font.heading}',
            fontSize: '{size.lg}',
            fontWeight: 700,
            color: '{color.text}',
          },
        },
      },
      {
        id: 'list',
        kind: 'element',
        tag: 'stack',
        visibleIf: { key: 'useCarousel', equals: false },
        style: {
          base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' },
        },
        children: [
          {
            id: 'item',
            kind: 'element',
            tag: 'stack',
            repeat: { source: 'self', path: 'items' },
            style: {
              base: { display: 'flex', flexDirection: 'column', gap: '{space.1}' },
            },
            children: [
              {
                id: 'titleRow',
                kind: 'element',
                tag: 'stack',
                style: {
                  base: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '{space.2}', width: '100%' },
                },
                children: [
                  {
                    id: 'title',
                    kind: 'element',
                    tag: 'text',
                    bind: { source: 'self', path: 'title' },
                    style: {
                      base: { fontSize: '{size.base}', fontWeight: 600, color: '{color.text}' },
                    },
                  },
                  {
                    id: 'dots',
                    kind: 'element',
                    tag: 'stack',
                    style: {
                      base: {
                        flexGrow: 1,
                        border: { sides: { b: { width: '2px', style: 'dotted', color: '{color.border}' } } },
                        opacity: 0.4,
                        margin: { b: '4px' },
                      },
                    },
                  },
                  {
                    id: 'price',
                    kind: 'element',
                    tag: 'text',
                    bind: { source: 'self', path: 'price' },
                    style: {
                      base: { fontSize: '{size.base}', fontWeight: 700, color: '{color.primary}' },
                    },
                  },
                ],
              },
              {
                id: 'description',
                kind: 'element',
                tag: 'text',
                hideIfEmpty: true,
                bind: { source: 'self', path: 'description' },
                style: {
                  base: { fontSize: '{size.sm}', color: '{color.muted}', lineHeight: 1.4 },
                },
              },
            ],
          },
        ],
      },
      {
        id: "carouselRoot",
        kind: "element",
        tag: "stack",
        name: "Carousel Container",
        visibleIf: { key: "useCarousel", equals: true },
        style: {
          base: { position: "relative", display: "flex", flexDirection: "column", gap: "{space.4}" },
        },
        children: [
          {
            id: "carouselTrack",
            kind: "element",
            tag: "carousel",
            name: "Carousel Track",
            children: [
              {
                id: "carouselItem",
                kind: "element",
                tag: "stack",
                name: "Price Item",
                repeat: { source: "self", path: "items" },
                style: {
                  base: { display: "flex", flexDirection: "column", gap: "{space.1}", padding: { all: "{space.3}" }, background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "{radius.lg}" }, border: { style: "solid", width: "1px", color: "{color.border}" } },
                },
                children: [
                  {
                    id: "c_titleRow",
                    kind: "element",
                    tag: "stack",
                    style: { base: { display: "flex", flexDirection: "row", alignItems: "baseline", gap: "{space.2}" } },
                    children: [
                      { id: "c_title", kind: "element", tag: "text", name: "Title", bind: { source: "self", path: "title" }, style: { base: { fontSize: "{size.base}", fontWeight: 600, color: "{color.text}" } } },
                      { id: "c_line", kind: "element", tag: "stack", style: { base: { flexGrow: 1, border: { sides: { b: { width: "2px", style: "dotted", color: "{color.border}" } } }, opacity: 0.4, margin: { b: "4px" } } } },
                      { id: "c_price", kind: "element", tag: "text", name: "Price", bind: { source: "self", path: "price" }, style: { base: { fontSize: "{size.base}", fontWeight: 700, color: "{color.primary}" } } },
                    ]
                  },
                  { id: "c_description", kind: "element", tag: "text", name: "Description", hideIfEmpty: true, bind: { source: "self", path: "description" }, style: { base: { fontSize: "{size.sm}", color: "{color.muted}", lineHeight: 1.4 } } },
                ],
              }
            ]
          },
          {
            id: "carouselArrows",
            kind: "element",
            tag: "frame",
            name: "Arrows",
            visibleIf: { key: "showArrows", equals: true },
            children: [
              {
                id: "arrowPrev",
                kind: "element",
                tag: "button",
                name: "Prev Arrow",
                props: { action: "carousel-prev" },
                style: {
                  base: { position: "absolute", left: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10, width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" }, border: { style: "solid", width: "1px", color: "{color.border}" }, boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer" },
                },
                children: [{ id: "iconPrev", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronLeft" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }]
              },
              {
                id: "arrowNext",
                kind: "element",
                tag: "button",
                name: "Next Arrow",
                props: { action: "carousel-next" },
                style: {
                  base: { position: "absolute", right: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10, width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" }, border: { style: "solid", width: "1px", color: "{color.border}" }, boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer" },
                },
                children: [{ id: "iconNext", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronRight" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }]
              }
            ]
          },
          {
            id: "carouselDots",
            kind: "element",
            tag: "stack",
            name: "Pagination",
            visibleIf: { key: "showCarouselDots", equals: true },
            style: { base: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "{space.2}", margin: { t: "{space.2}" } } },
            children: [
              {
                id: "dot",
                kind: "element",
                tag: "button",
                name: "Dot",
                repeat: { source: "self", path: "items" },
                props: { action: "carousel-dot" },
                style: { base: { width: "8px", height: "8px", borderRadius: { all: "50%" }, background: { kind: "color", color: "{color.border}" }, cursor: "pointer", padding: { all: "0" }, border: { style: "none", width: "0" } } },
              }
            ]
          }
        ]
      },
    ],
  },
  designSchema: [
    { key: 'showDots', type: 'boolean', label: 'Show dotted line between title and price' },
    { key: 'showDividers', type: 'boolean', label: 'Show dividers between items' },
    { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },
    { key: 'showArrows', type: 'boolean', label: 'Show Arrows', visibleIf: { key: 'useCarousel', equals: true } },
    { key: 'showCarouselDots', type: 'boolean', label: 'Show Pagination', visibleIf: { key: 'useCarousel', equals: true } },
  ],
  contentSchema: [
    { key: 'heading', type: 'text', label: 'Heading', max: 60 },
    {
      key: 'items', type: 'repeater', label: 'Menu Items', itemLabel: '{title}',
      fields: [
        { key: 'title', type: 'text', label: 'Item Name', max: 60 },
        { key: 'price', type: 'text', label: 'Price', max: 20 },
        { key: 'description', type: 'text', label: 'Description', max: 120 },
      ]
    }
  ],

  defaultDesign: { showDots: true, showDividers: false, useCarousel: false, showArrows: true, showCarouselDots: true },
  defaultContent: {
    heading: 'Services',
    items: [
      { title: 'Consultation', price: '$50', description: 'Initial 30-minute discovery call.' },
      { title: 'Basic Package', price: '$299', description: 'Essential features to get you started.' },
      { title: 'Pro Package', price: '$899', description: 'Full suite of premium services.' },
    ]
  }
};

export const previews = {
  empty: { heading: '', items: [] },
  typical: meta.defaultContent,
  stress: { heading: 'A'.repeat(60), items: Array(8).fill({ title: 'A'.repeat(60), price: '$9,999.00', description: 'A'.repeat(120) }) }
};
