"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'IMAGE',
    label: 'Image',
    iconName: 'Image',
    group: 'media',
    description: 'A single image, optionally linked, with a caption.',
    contentVersion: 1,
    contentSchema: [
        { key: 'src', type: 'image', label: 'Image', ratio: '16/9' },
        { key: 'alt', type: 'text', label: 'Alt text', max: 120 },
        { key: 'caption', type: 'text', label: 'Caption', max: 120 },
        { key: 'link', type: 'url', label: 'Link' },
    ],
    defaultDesign: { ratio: '16/9', fit: 'cover', showCaption: false },
    defaultContent: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', alt: 'Demo image', caption: '', link: '' },
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'image',
        bind: { source: 'self', path: 'src' },
        style: {
            base: {
                width: '100%',
                borderRadius: { all: '{radius.lg}' },
                objectFit: 'cover',
            },
        },
    },
};
exports.previews = {
    empty: { src: '' },
    typical: { src: 'https://picsum.photos/seed/ts/800/450', alt: 'Preview', caption: 'A caption', link: '' },
    stress: { src: 'https://picsum.photos/seed/ts/800/450', alt: 'A'.repeat(120), caption: 'B'.repeat(120), link: '' },
};
