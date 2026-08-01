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
    ],
    contentSchema: [
        { key: "useCarousel", type: "boolean", label: "Enable Carousel" },
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
        layout: 'grid-2',
        showMedia: true,
        mediaRatio: '4/3',
        showDesc: true,
        showPrice: false,
        autoplay: false,
    },
    defaultContent: {
        useCarousel: false,
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
                id: "carouselTrack",
                kind: "element",
                tag: "carousel",
                name: "Carousel",
                visibleIf: { key: "useCarousel", equals: true },
                children: [
                    {
                        id: 'c_item',
                        kind: 'element',
                        tag: 'frame',
                        name: 'Carousel Item',
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
                                id: 'c_itemMedia',
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
                                id: 'c_itemTitle',
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
                                id: 'c_itemDesc',
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
                                id: 'c_itemPrice',
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
                                id: 'c_itemLink',
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
