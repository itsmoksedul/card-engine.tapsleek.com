"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'LOGO_WALL',
    label: 'Logo Wall',
    iconName: 'Image',
    group: 'business',
    description: 'A grid of logos for partners, clients, or certifications.',
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
        items: [],
    },
};
exports.previews = {
    empty: { items: [] },
    typical: { items: [{ url: 'https://via.placeholder.com/150' }, { url: 'https://via.placeholder.com/150' }] },
    stress: { items: Array(10).fill({ url: 'https://via.placeholder.com/150' }) },
};
