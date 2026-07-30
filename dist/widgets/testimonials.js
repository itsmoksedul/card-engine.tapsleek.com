"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.migrations = exports.meta = void 0;
exports.meta = {
    type: 'TESTIMONIALS',
    label: 'Testimonials',
    iconName: 'Quote',
    group: 'business',
    description: 'Customer quotes with optional avatar and rating.',
    contentVersion: 2,
    interactive: true,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'title', label: 'Section title', kind: 'text' },
        { key: 'list', label: 'List', kind: 'list' },
        { key: 'item', label: 'Testimonial card', kind: 'container' },
        { key: 'mark', label: 'Quote mark', kind: 'icon' },
        { key: 'quote', label: 'Quote text', kind: 'text' },
        { key: 'stars', label: 'Rating stars', kind: 'list' },
        { key: 'caption', label: 'Author row', kind: 'container' },
        { key: 'avatar', label: 'Avatar', kind: 'image' },
        { key: 'author', label: 'Author name', kind: 'text' },
        { key: 'role', label: 'Author role', kind: 'text' },
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
    defaultPartStyles: {
        root: {
            base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' },
        },
        title: {
            base: {
                fontFamily: '{font.heading}',
                fontSize: '{size.lg}',
                fontWeight: 700,
                color: '{color.text}',
            },
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
    },
    defaultDesign: { layout: 'stack', showAvatar: true, showRating: true, quoteMark: 'icon' },
    defaultContent: {
        title: 'What clients say',
        items: [
            { author: 'Jane Doe', role: 'CEO, Acme Corp', quote: 'Tapsleek made connecting with clients seamless and beautiful.', avatar: '', rating: 5 },
            { author: 'John Smith', role: 'Founder, Startup', quote: 'Highly recommended for any modern professional.', avatar: '', rating: 5 },
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
                id: 'list',
                kind: 'element',
                tag: 'stack',
                name: 'List',
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
        ],
    },
};
/** v1 → v2: `text`/`name` renamed to `quote`/`author`. */
exports.migrations = {
    2: (c) => ({
        title: c?.title ?? '',
        items: Array.isArray(c?.items)
            ? c.items.map((i) => ({
                quote: i?.quote ?? i?.text ?? '',
                author: i?.author ?? i?.name ?? '',
                role: i?.role ?? '',
                avatar: i?.avatar ?? '',
                rating: typeof i?.rating === 'number' ? i.rating : undefined,
            }))
            : [],
    }),
};
exports.previews = {
    empty: { title: '', items: [] },
    typical: exports.meta.defaultContent,
    stress: {
        title: 'A'.repeat(60),
        items: Array.from({ length: 20 }, () => ({
            quote: 'Q'.repeat(300), author: 'N'.repeat(60), role: 'R'.repeat(60), avatar: '', rating: 5,
        })),
    },
};
