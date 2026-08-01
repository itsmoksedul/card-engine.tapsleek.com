"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
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
                id: "carouselTrack",
                kind: "element",
                tag: "carousel",
                name: "Carousel",
                visibleIf: { key: "useCarousel", equals: true },
                children: [
                    {
                        id: 'c_item',
                        kind: 'element',
                        tag: 'stack',
                        name: "Carousel Item",
                        repeat: { source: 'self', path: 'items' },
                        style: {
                            base: { display: 'flex', flexDirection: 'column', gap: '{space.1}' },
                        },
                        children: [
                            {
                                id: 'c_titleRow',
                                kind: 'element',
                                tag: 'stack',
                                style: {
                                    base: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '{space.2}', width: '100%' },
                                },
                                children: [
                                    {
                                        id: 'c_title',
                                        kind: 'element',
                                        tag: 'text',
                                        name: 'Title',
                                        bind: { source: 'self', path: 'title' },
                                        style: {
                                            base: { fontSize: '{size.base}', fontWeight: 600, color: '{color.text}' },
                                        },
                                    },
                                    {
                                        id: 'c_dots',
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
                                        id: 'c_price',
                                        kind: 'element',
                                        tag: 'text',
                                        name: 'Price',
                                        bind: { source: 'self', path: 'price' },
                                        style: {
                                            base: { fontSize: '{size.base}', fontWeight: 700, color: '{color.primary}' },
                                        },
                                    },
                                ],
                            },
                            {
                                id: 'c_description',
                                kind: 'element',
                                tag: 'text',
                                name: 'Description',
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
        ],
    },
    designSchema: [
        { key: 'showDots', type: 'boolean', label: 'Show dotted line between title and price' },
        { key: 'showDividers', type: 'boolean', label: 'Show dividers between items' },
    ],
    contentSchema: [
        { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },
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
    defaultDesign: { showDots: true, showDividers: false },
    defaultContent: {
        useCarousel: false,
        heading: 'Services',
        items: [
            { title: 'Consultation', price: '$50', description: 'Initial 30-minute discovery call.' },
            { title: 'Basic Package', price: '$299', description: 'Essential features to get you started.' },
            { title: 'Pro Package', price: '$899', description: 'Full suite of premium services.' },
        ]
    }
};
exports.previews = {
    empty: { heading: '', items: [] },
    typical: exports.meta.defaultContent,
    stress: { heading: 'A'.repeat(60), items: Array(8).fill({ title: 'A'.repeat(60), price: '$9,999.00', description: 'A'.repeat(120) }) }
};
