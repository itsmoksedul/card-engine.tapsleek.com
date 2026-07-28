"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'TIMELINE',
    label: 'Timeline',
    iconName: 'ListOrdered',
    group: 'business',
    description: 'A vertical timeline of events, history, or steps.',
    contentVersion: 1,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'heading', label: 'Heading', kind: 'text' },
        { key: 'list', label: 'Timeline List', kind: 'list' },
        { key: 'item', label: 'Timeline Item', kind: 'container' },
        { key: 'bullet', label: 'Bullet Point', kind: 'container' },
        { key: 'line', label: 'Connecting Line', kind: 'container' },
        { key: 'content', label: 'Content Wrapper', kind: 'container' },
        { key: 'date', label: 'Date / Step', kind: 'text' },
        { key: 'title', label: 'Title', kind: 'text' },
        { key: 'description', label: 'Description', kind: 'text' },
    ],
    designSchema: [
        {
            key: 'bulletStyle', type: 'select', label: 'Bullet Style',
            options: [
                { value: 'dot', label: 'Solid Dot' },
                { value: 'circle', label: 'Hollow Circle' },
            ],
        },
    ],
    contentSchema: [
        { key: 'heading', type: 'text', label: 'Heading', max: 60 },
        {
            key: 'items', type: 'repeater', label: 'Timeline Events', itemLabel: '{title}',
            fields: [
                { key: 'date', type: 'text', label: 'Date / Step (e.g. 2024)', max: 40 },
                { key: 'title', type: 'text', label: 'Title', max: 80 },
                { key: 'description', type: 'text', label: 'Description', max: 200 },
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
                flexDirection: 'column'
            }
        },
        item: {
            base: {
                display: 'flex',
                position: 'relative',
                padding: { b: '{space.4}' }
            }
        },
        bullet: {
            base: {
                width: '12px',
                height: '12px',
                margin: { t: '4px' },
                borderRadius: { all: '{radius.full}' },
                background: { kind: 'color', color: '{color.primary}' },
                zIndex: 2
            }
        },
        line: {
            base: {
                position: 'absolute',
                left: '5px',
                top: '16px',
                bottom: 0,
                width: '2px',
                background: { kind: 'color', color: '{color.border}' },
                zIndex: 1
            }
        },
        content: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.1}',
                padding: { l: '{space.4}' }
            }
        },
        date: {
            base: {
                fontSize: '{size.xs}',
                fontWeight: 600,
                color: '{color.primary}',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }
        },
        title: {
            base: {
                fontSize: '{size.base}',
                fontWeight: 600,
                color: '{color.text}'
            }
        },
        description: {
            base: {
                fontSize: '{size.sm}',
                color: '{color.muted}',
                lineHeight: 1.5
            }
        }
    },
    defaultDesign: { bulletStyle: 'dot' },
    defaultContent: {
        heading: 'Our Journey',
        items: [
            { date: '2022', title: 'Company Founded', description: 'Started in a small garage.' },
            { date: '2023', title: 'First Product Launch', description: 'Launched v1 to the public.' },
            { date: '2024', title: 'Global Expansion', description: 'Opened offices in 3 new countries.' },
        ]
    }
};
exports.previews = {
    empty: { heading: '', items: [] },
    typical: exports.meta.defaultContent,
    stress: { heading: 'A'.repeat(60), items: Array(5).fill({ date: 'A'.repeat(40), title: 'A'.repeat(80), description: 'A'.repeat(200) }) }
};
