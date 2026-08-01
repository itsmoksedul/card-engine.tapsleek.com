"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.migrations = exports.meta = void 0;
const carousel_parts_1 = require("./carousel-parts");
exports.meta = {
    type: 'SERVICE_LIST',
    label: 'Services',
    iconName: 'LayoutGrid',
    group: 'content',
    description: 'A titled list of services, products or features.',
    contentVersion: 2,
    interactive: true, // carousel layout needs client JS
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'header', label: 'Header', kind: 'container' },
        { key: 'title', label: 'Section title', kind: 'text' },
        { key: 'description', label: 'Section description', kind: 'text' },
        { key: 'list', label: 'List', kind: 'list' },
        { key: 'item', label: 'Item card', kind: 'container' },
        { key: 'itemMedia', label: 'Item image', kind: 'image', visibleIf: { key: 'showMedia', equals: true } },
        { key: 'itemTitle', label: 'Item title', kind: 'text' },
        { key: 'itemDesc', label: 'Item description', kind: 'text', visibleIf: { key: 'showDesc', equals: true } },
        { key: 'itemPrice', label: 'Item price', kind: 'text' },
        { key: 'itemLink', label: 'Item link', kind: 'text' },
        ...carousel_parts_1.carouselParts,
    ],
    designSchema: [
        {
            key: 'layout', type: 'select', label: 'Layout',
            options: [
                { value: 'list', label: 'List' },
                { value: 'grid-2', label: '2 columns' },
                { value: 'grid-3', label: '3 columns' },
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
        { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },
        { key: 'showArrows', type: 'boolean', label: 'Show Arrows', visibleIf: { key: 'useCarousel', equals: true } },
        { key: 'showDots', type: 'boolean', label: 'Show Pagination', visibleIf: { key: 'useCarousel', equals: true } },
    ],
    contentSchema: [
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        { key: 'description', type: 'text', label: 'Description', max: 200 },
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
    defaultPartStyles: {
        root: { base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' } },
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
        list: { base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '{space.3}' } },
        item: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.1}',
                padding: { all: '{space.3}' },
                background: { kind: 'color', color: '{color.surface}' },
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.md}' },
                transition: { property: ['box-shadow', 'transform'], duration: 150, easing: 'ease' },
            },
            hover: { boxShadow: '{shadow.md}', transform: { translateY: '-2px' } },
        },
        itemMedia: {
            base: {
                width: '100%',
                aspectRatio: '4/3',
                objectFit: 'cover',
                borderRadius: { all: '{radius.sm}' },
                margin: { b: '{space.2}' },
            },
        },
        itemTitle: {
            base: { fontSize: '{size.sm}', fontWeight: 600, color: '{color.text}' },
        },
        itemDesc: {
            base: { fontSize: '{size.xs}', lineHeight: 1.5, color: '{color.muted}', lineClamp: 3 },
        },
        itemPrice: {
            base: { fontSize: '{size.sm}', fontWeight: 700, color: '{color.primary}' },
        },
        itemLink: {
            base: { fontSize: '{size.xs}', fontWeight: 600, color: '{color.primary}' },
        },
        ...carousel_parts_1.carouselDefaultPartStyles,
    },
    defaultDesign: {
        layout: 'list',
        showMedia: true,
        mediaRatio: '1/1',
        showDesc: true,
        showPrice: true,
        useCarousel: false,
        showArrows: true,
        showDots: true,
    },
    defaultContent: {
        title: 'Our Services',
        description: '',
        items: [
            { name: 'Brand Design', description: 'Identity systems that scale.', image: '', price: '', link: '' },
            { name: 'Web Development', description: 'Fast, accessible websites.', image: '', price: '', link: '' },
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
                        name: 'Section description',
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
                name: 'List',
                visibleIf: { key: 'useCarousel', equals: false },
                style: { base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '{space.3}' } },
                children: [
                    {
                        id: 'item',
                        kind: 'element',
                        tag: 'frame',
                        name: 'Item card',
                        repeat: { source: 'self', path: 'items' },
                        style: {
                            base: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '{space.1}',
                                padding: { all: '{space.3}' },
                                background: { kind: 'color', color: '{color.surface}' },
                                border: { width: '1px', style: 'solid', color: '{color.border}' },
                                borderRadius: { all: '{radius.md}' },
                            },
                        },
                        children: [
                            {
                                id: 'itemMedia',
                                kind: 'element',
                                tag: 'image',
                                name: 'Item image',
                                bind: { source: 'self', path: 'image' },
                                hideIfEmpty: true,
                                style: {
                                    base: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: { all: '{radius.sm}' }, margin: { b: '{space.2}' } },
                                },
                            },
                            {
                                id: 'itemTitle',
                                kind: 'element',
                                tag: 'heading',
                                name: 'Item title',
                                props: { level: 4 },
                                bind: { source: 'self', path: 'name' },
                                hideIfEmpty: true,
                                style: {
                                    base: { fontSize: '{size.sm}', fontWeight: 600, color: '{color.text}' },
                                },
                            },
                            {
                                id: 'itemDesc',
                                kind: 'element',
                                tag: 'text',
                                name: 'Item description',
                                bind: { source: 'self', path: 'description' },
                                hideIfEmpty: true,
                                style: {
                                    base: { fontSize: '{size.xs}', lineHeight: 1.5, color: '{color.muted}' },
                                },
                            },
                            {
                                id: 'itemPrice',
                                kind: 'element',
                                tag: 'text',
                                name: 'Item price',
                                bind: { source: 'self', path: 'price' },
                                hideIfEmpty: true,
                                style: {
                                    base: { fontSize: '{size.sm}', fontWeight: 700, color: '{color.primary}' },
                                },
                            },
                            {
                                id: 'itemLink',
                                kind: 'element',
                                tag: 'link',
                                name: 'Item link',
                                bind: { source: 'self', path: 'link' },
                                props: { action: 'link', label: 'Learn more' },
                                hideIfEmpty: true,
                                style: {
                                    base: { fontSize: '{size.xs}', fontWeight: 600, color: '{color.primary}' },
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
                style: { base: { position: "relative", display: "flex", flexDirection: "column", gap: "{space.4}" } },
                children: [
                    {
                        id: 'carouselTrack',
                        kind: 'element',
                        tag: 'carousel',
                        name: 'Carousel Track',
                        children: [
                            {
                                id: 'c_item',
                                kind: 'element',
                                tag: 'stack',
                                name: 'Service Item',
                                repeat: { source: 'self', path: 'items' },
                                style: {
                                    base: { display: 'flex', flexDirection: 'column', gap: '{space.3}', padding: { all: '{space.4}' }, background: { kind: 'color', color: '{color.surface}' }, borderRadius: { all: '{radius.md}' }, border: { style: 'solid', width: '1px', color: '{color.border}' } },
                                },
                                children: [
                                    { id: 'c_media', kind: 'element', tag: 'image', bind: { source: 'self', path: 'image' }, hideIfEmpty: true, style: { base: { width: '100%', height: '140px', objectFit: 'cover', borderRadius: { all: '{radius.md}' } } } },
                                    {
                                        id: 'c_content',
                                        kind: 'element',
                                        tag: 'stack',
                                        style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}', flexGrow: 1 } },
                                        children: [
                                            {
                                                id: 'c_header',
                                                kind: 'element',
                                                tag: 'stack',
                                                style: { base: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '{space.2}' } },
                                                children: [
                                                    { id: 'c_itemTitle', kind: 'element', tag: 'heading', props: { level: 4 }, bind: { source: 'self', path: 'name' }, style: { base: { fontSize: '{size.base}', fontWeight: 600, color: '{color.text}' } } },
                                                    { id: 'c_itemPrice', kind: 'element', tag: 'text', bind: { source: 'self', path: 'price' }, hideIfEmpty: true, style: { base: { fontSize: '{size.base}', fontWeight: 600, color: '{color.primary}' } } },
                                                ],
                                            },
                                            { id: 'c_itemDesc', kind: 'element', tag: 'text', bind: { source: 'self', path: 'description' }, hideIfEmpty: true, style: { base: { fontSize: '{size.sm}', color: '{color.muted}', lineHeight: 1.4 } } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: "carouselArrows",
                        kind: "element",
                        tag: "frame",
                        name: "Arrows",
                        visibleIf: { key: "showArrows", equals: true },
                        children: [
                            { id: "arrowPrev", kind: "element", tag: "button", name: "Prev Arrow", props: { action: "carousel-prev" }, style: { base: { position: "absolute", left: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10, width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" }, border: { style: "solid", width: "1px", color: "{color.border}" }, boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer" } }, children: [{ id: "iconPrev", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronLeft" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }] },
                            { id: "arrowNext", kind: "element", tag: "button", name: "Next Arrow", props: { action: "carousel-next" }, style: { base: { position: "absolute", right: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10, width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" }, border: { style: "solid", width: "1px", color: "{color.border}" }, boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer" } }, children: [{ id: "iconNext", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronRight" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }] }
                        ]
                    },
                    {
                        id: "carouselDots",
                        kind: "element",
                        tag: "stack",
                        name: "Pagination",
                        visibleIf: { key: "showDots", equals: true },
                        style: { base: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "{space.2}", margin: { t: "{space.2}" } } },
                        children: [
                            { id: "dot", kind: "element", tag: "button", name: "Dot", repeat: { source: "self", path: "items" }, props: { action: "carousel-dot" }, style: { base: { width: "8px", height: "8px", borderRadius: { all: "50%" }, background: { kind: "color", color: "{color.border}" }, cursor: "pointer", padding: { all: "0" }, border: { style: "none", width: "0" } } } }
                        ]
                    }
                ]
            },
        ],
    },
};
/**
 * v1 → v2: `url` was renamed to `link`, and the section header moved from a
 * bare string into `title` + `description`. Runs lazily on read; nothing is
 * rewritten in bulk.
 */
exports.migrations = {
    2: (c) => ({
        title: c?.title ?? c?.heading ?? '',
        description: c?.description ?? c?.subtitle ?? '',
        items: Array.isArray(c?.items)
            ? c.items.map((i) => ({
                image: i?.image ?? '',
                name: i?.name ?? i?.label ?? '',
                description: i?.description ?? i?.desc ?? '',
                price: i?.price ?? '',
                link: i?.link ?? i?.url ?? '',
            }))
            : [],
    }),
};
exports.previews = {
    empty: { title: '', description: '', items: [] },
    typical: exports.meta.defaultContent,
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
