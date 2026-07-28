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
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'image', label: 'Image', kind: 'image' },
        { key: 'caption', label: 'Caption', kind: 'text' },
    ],
    designSchema: [
        {
            key: 'ratio', type: 'select', label: 'Aspect ratio',
            options: [
                { value: 'auto', label: 'Original' },
                { value: '1/1', label: 'Square' },
                { value: '4/3', label: '4:3' },
                { value: '16/9', label: '16:9' },
            ],
        },
        {
            key: 'fit', type: 'select', label: 'Fit',
            options: [
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
            ],
        },
        { key: 'showCaption', type: 'boolean', label: 'Show caption' },
    ],
    contentSchema: [
        { key: 'src', type: 'image', label: 'Image', ratio: '16/9' },
        { key: 'alt', type: 'text', label: 'Alt text', max: 120 },
        { key: 'caption', type: 'text', label: 'Caption', max: 120 },
        { key: 'link', type: 'url', label: 'Link' },
    ],
    defaultPartStyles: {
        root: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
        image: {
            base: {
                width: '100%',
                borderRadius: { all: '{radius.lg}' },
                objectFit: 'cover',
            },
        },
        caption: {
            base: { fontSize: '{size.xs}', color: '{color.muted}', textAlign: 'center' },
        },
    },
    defaultDesign: { ratio: '16/9', fit: 'cover', showCaption: false },
    defaultContent: { src: '', alt: '', caption: '', link: '' },
};
exports.previews = {
    empty: { src: '' },
    typical: { src: 'https://picsum.photos/seed/ts/800/450', alt: 'Preview', caption: 'A caption', link: '' },
    stress: { src: 'https://picsum.photos/seed/ts/800/450', alt: 'A'.repeat(120), caption: 'B'.repeat(120), link: '' },
};
