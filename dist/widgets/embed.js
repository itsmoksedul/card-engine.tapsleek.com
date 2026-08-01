"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'EMBED',
    label: 'Embed',
    iconName: 'Code',
    group: 'media',
    description: 'Embed external content like Spotify, Calendly, or Typeform via iframe HTML.',
    contentVersion: 1,
    interactive: true,
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        style: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.3}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                borderRadius: { all: '{radius.lg}' },
            },
        },
        children: [
            {
                id: 'wrapper',
                kind: 'element',
                tag: 'embed',
                bind: { source: 'self', path: 'html' },
                style: {
                    base: {
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: { all: '{radius.md}' },
                        display: 'flex',
                        flexDirection: 'column',
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
            key: 'height', type: 'select', label: 'Height',
            options: [
                { value: 'auto', label: 'Auto' },
                { value: 'small', label: 'Small (150px)' },
                { value: 'medium', label: 'Medium (300px)' },
                { value: 'large', label: 'Large (600px)' },
                { value: 'full', label: 'Full Screen (100vh)' },
            ],
        },
        { key: 'removePadding', type: 'boolean', label: 'Remove container padding' },
    ],
    contentSchema: [
        {
            key: 'html',
            type: 'textarea',
            label: 'Embed Code',
            hint: 'Paste the <iframe> code from Spotify, Calendly, Google Maps, etc.'
        },
        { key: 'caption', type: 'text', label: 'Caption', max: 120 },
    ],
    defaultDesign: { height: 'auto', removePadding: false },
    defaultContent: {
        html: '',
        caption: '',
    }
};
exports.previews = {
    empty: { html: '', caption: '' },
    typical: { html: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>', caption: '' },
    stress: { html: 'A'.repeat(500), caption: 'A'.repeat(120) }
};
