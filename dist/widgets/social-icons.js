"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
const PLATFORMS = [
    'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
    'tiktok', 'github', 'discord', 'twitch', 'website'
];
exports.meta = {
    type: 'SOCIAL_ICONS',
    label: 'Social Icons',
    iconName: 'Twitter',
    group: 'contact',
    description: 'A dedicated row or grid of social media icons.',
    contentVersion: 1,
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        style: {
            base: {
                width: '100%',
                padding: { t: '{space.2}', b: '{space.2}' },
                alignItems: 'center', // map layout option if needed later via css
            },
        },
        children: [
            {
                id: 'list',
                kind: 'element',
                tag: 'stack',
                style: {
                    base: {
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: '{space.3}',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                },
                children: [
                    {
                        id: 'item',
                        kind: 'element',
                        tag: 'link',
                        repeat: { source: 'self', path: 'profiles' },
                        bind: { source: 'self', path: 'url' },
                        style: {
                            base: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                background: { kind: 'color', color: '{color.surface}' },
                                color: '{color.text}',
                                borderRadius: { all: '{radius.full}' },
                                transition: { property: ['transform', 'background-color'], duration: 150, easing: 'ease' },
                            },
                            hover: {
                                transform: { translateY: '-2px' },
                                background: { kind: 'color', color: '{color.border}' },
                            },
                        },
                        children: [
                            {
                                id: 'icon',
                                kind: 'element',
                                tag: 'icon',
                                bind: { source: 'self', path: 'platform' },
                                style: {
                                    base: { width: '20px', height: '20px' },
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    designSchema: [
        {
            key: 'layout', type: 'select', label: 'Layout',
            options: [
                { value: 'left', label: 'Row (Left aligned)' },
                { value: 'center', label: 'Row (Centered)' },
                { value: 'grid', label: 'Grid' },
            ],
        },
        {
            key: 'size', type: 'select', label: 'Icon Size',
            options: [
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
            ],
        }
    ],
    contentSchema: [
        {
            key: 'profiles', type: 'repeater', label: 'Social Profiles', itemLabel: '{platform}',
            fields: [
                {
                    key: 'platform', type: 'select', label: 'Platform',
                    options: PLATFORMS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))
                },
                { key: 'url', type: 'url', label: 'Profile URL' }
            ]
        }
    ],
    defaultDesign: { layout: 'center', size: 'md' },
    defaultContent: {
        profiles: [
            { platform: 'twitter', url: 'https://twitter.com' },
            { platform: 'instagram', url: 'https://instagram.com' }
        ]
    }
};
exports.previews = {
    empty: { profiles: [] },
    typical: exports.meta.defaultContent,
    stress: { profiles: Array(10).fill({ platform: 'github', url: '#' }) }
};
