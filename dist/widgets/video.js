"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'VIDEO',
    label: 'Video',
    iconName: 'Video',
    group: 'media',
    description: 'Embed a single YouTube, Vimeo, or direct MP4 video.',
    contentVersion: 1,
    interactive: true,
    defaultLayout: {
        id: 'video-root',
        kind: 'element',
        tag: 'stack',
        style: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.2}',
                background: { kind: 'color', color: '{color.surface}' },
                borderRadius: { all: '{radius.lg}' },
            },
        },
        children: [
            {
                id: 'player',
                kind: 'element',
                tag: 'video',
                bind: { source: 'self', path: 'url' },
                props: { controls: true },
                style: {
                    base: {
                        position: 'relative',
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: { all: '{radius.md}' },
                        background: { kind: 'color', color: '#000' },
                        aspectRatio: '16/9',
                    },
                },
            },
            {
                id: 'caption',
                kind: 'element',
                tag: 'text',
                hideIfEmpty: true,
                bind: { source: 'self', path: 'caption' },
                style: {
                    base: {
                        fontSize: '{size.sm}',
                        color: '{color.muted}',
                        textAlign: 'center',
                    },
                },
            },
        ],
    },
    designSchema: [
        {
            key: 'aspectRatio', type: 'select', label: 'Aspect Ratio',
            options: [
                { value: '16/9', label: '16:9 Widescreen' },
                { value: '4/3', label: '4:3 Standard' },
                { value: '1/1', label: '1:1 Square' },
                { value: '9/16', label: '9:16 Vertical (Shorts)' },
            ],
        },
        { key: 'controls', type: 'boolean', label: 'Show Controls' },
        { key: 'autoplay', type: 'boolean', label: 'Autoplay (Muted)' },
        { key: 'loop', type: 'boolean', label: 'Loop' },
    ],
    contentSchema: [
        { key: 'url', type: 'url', label: 'Video URL', hint: 'YouTube, Vimeo, or direct MP4 link.' },
        { key: 'thumbnail', type: 'image', label: 'Thumbnail Image', ratio: '16/9', hint: 'Only applies to direct MP4 videos. YouTube/Vimeo fetch their own.' },
        { key: 'caption', type: 'text', label: 'Caption', max: 120 },
    ],
    defaultDesign: { aspectRatio: '16/9', controls: true, autoplay: false, loop: false },
    defaultContent: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: '',
        caption: '',
    }
};
exports.previews = {
    empty: { url: '', thumbnail: '', caption: '' },
    typical: exports.meta.defaultContent,
    stress: { url: exports.meta.defaultContent.url, thumbnail: '', caption: 'A'.repeat(120) }
};
