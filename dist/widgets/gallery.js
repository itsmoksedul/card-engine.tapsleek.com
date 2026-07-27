"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'GALLERY',
    label: 'Gallery',
    iconName: 'Images',
    group: 'media',
    description: 'A set of images.',
    contentVersion: 1,
    interactive: true,
    parts: [
        { key: 'root', label: 'Container' },
        { key: 'title', label: 'Title' },
        { key: 'list', label: 'Grid' },
        { key: 'item', label: 'Image wrapper' },
        { key: 'image', label: 'Image' },
        { key: 'caption', label: 'Caption' },
    ],
    designSchema: [
        {
            key: 'layout', type: 'select', label: 'Layout',
            options: [
                { value: 'grid-2', label: '2 columns' },
                { value: 'grid-3', label: '3 columns' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'masonry', label: 'Masonry' },
            ],
        },
        {
            key: 'ratio', type: 'select', label: 'Image ratio',
            options: [
                { value: '1/1', label: 'Square' },
                { value: '4/3', label: '4:3' },
                { value: '3/4', label: '3:4' },
                { value: '16/9', label: '16:9' },
                { value: 'auto', label: 'Original' },
            ],
        },
        { key: 'showCaption', type: 'boolean', label: 'Show captions' },
        { key: 'lightbox', type: 'boolean', label: 'Open full size on tap' },
    ],
    contentSchema: [
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        {
            key: 'items', type: 'repeater', label: 'Images', max: 40, itemLabel: '{caption}',
            fields: [
                { key: 'url', type: 'image', label: 'Image', required: true, maxMB: 5 },
                { key: 'caption', type: 'text', label: 'Caption', max: 80 },
                { key: 'link', type: 'url', label: 'Link' },
            ],
        },
    ],
    defaultDesign: { layout: 'grid-2', ratio: '1/1', showCaption: false, lightbox: true },
    defaultContent: { title: 'Gallery', items: [] },
};
exports.previews = {
    empty: { title: '', items: [] },
    typical: { title: 'Our work', items: [{ url: 'https://cdn.tapsleek.com/demo/1.jpg', caption: '', link: '' }] },
    stress: {
        title: 'A'.repeat(60),
        items: Array.from({ length: 40 }, (_, i) => ({
            url: `https://cdn.tapsleek.com/demo/${i}.jpg`,
            caption: 'C'.repeat(80),
            link: '',
        })),
    },
};
