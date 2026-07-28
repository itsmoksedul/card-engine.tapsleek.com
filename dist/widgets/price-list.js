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
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'heading', label: 'Heading', kind: 'text' },
        { key: 'list', label: 'List', kind: 'list' },
        { key: 'item', label: 'Item Container', kind: 'container' },
        { key: 'titleRow', label: 'Title & Price Row', kind: 'container' },
        { key: 'title', label: 'Item Title', kind: 'text' },
        { key: 'dots', label: 'Dotted Leader', kind: 'container' },
        { key: 'price', label: 'Price', kind: 'text' },
        { key: 'description', label: 'Description', kind: 'text' },
    ],
    designSchema: [
        { key: 'showDots', type: 'boolean', label: 'Show dotted line between title and price' },
        { key: 'showDividers', type: 'boolean', label: 'Show dividers between items' },
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
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.3}'
            }
        },
        item: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.1}'
            }
        },
        titleRow: {
            base: {
                display: 'flex',
                alignItems: 'center',
                gap: '{space.2}',
                width: '100%'
            }
        },
        title: {
            base: {
                fontSize: '{size.base}',
                fontWeight: 600,
                color: '{color.text}'
            }
        },
        dots: {
            base: {
                flexGrow: 1,
                border: { sides: { b: { width: '2px', style: 'dotted', color: '{color.border}' } } },
                opacity: 0.4,
                margin: { b: '4px' }
            }
        },
        price: {
            base: {
                fontSize: '{size.base}',
                fontWeight: 700,
                color: '{color.primary}'
            }
        },
        description: {
            base: {
                fontSize: '{size.sm}',
                color: '{color.muted}',
                lineHeight: 1.4
            }
        }
    },
    defaultDesign: { showDots: true, showDividers: false },
    defaultContent: {
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
