"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'LOGO_WALL',
    label: 'Logo Wall',
    iconName: 'Image',
    group: 'business',
    description: 'A grid of logos for partners, clients, or certifications.',
    deprecated: {
        since: '2.1',
        note: 'Logo Wall has been deprecated. Use Gallery or custom blocks instead.',
    },
    contentVersion: 1,
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        style: {
            base: {
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                borderRadius: { all: '{radius.lg}' },
            },
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
                        name: 'Title',
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
                tag: 'grid',
                style: {
                    base: {
                        display: 'grid',
                        gap: '{space.4}',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                        alignItems: 'center',
                    },
                },
                children: [
                    {
                        id: 'item',
                        kind: 'element',
                        tag: 'image',
                        repeat: { source: 'self', path: 'items' },
                        bind: { source: 'self', path: 'url' },
                        style: {
                            base: {
                                width: '100%',
                                height: 'auto',
                                maxHeight: '60px',
                                objectFit: 'contain',
                                opacity: 0.8,
                            },
                            hover: { opacity: 1 },
                        },
                    },
                ],
            },
        ],
    },
    designSchema: [],
    defaultDesign: {},
    contentSchema: [
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        { key: 'description', type: 'text', label: 'Description', max: 200 },
        {
            key: 'items',
            type: 'repeater',
            label: 'Logos',
            itemLabel: 'Logo',
            fields: [
                { key: 'url', type: 'image', label: 'Logo Image' },
            ],
        },
    ],
    defaultContent: {
        title: '',
        description: '',
        items: [],
    },
};
exports.previews = {
    empty: { items: [] },
    typical: { items: [{ url: 'https://via.placeholder.com/150' }, { url: 'https://via.placeholder.com/150' }] },
    stress: { items: Array(10).fill({ url: 'https://via.placeholder.com/150' }) },
};
