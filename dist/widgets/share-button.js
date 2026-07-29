"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'SHARE_BUTTON',
    label: 'Share Card',
    iconName: 'Share',
    group: 'system',
    description: 'A button to share the digital business card link.',
    contentVersion: 1,
    derived: true,
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        style: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: { all: '{space.4}' },
            },
        },
        children: [
            {
                id: 'button',
                kind: 'element',
                tag: 'button',
                props: { action: 'share' },
                bind: { source: 'card', field: 'shareUrl' },
                style: {
                    base: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '{space.2}',
                        padding: { t: '{space.3}', r: '{space.6}', b: '{space.3}', l: '{space.6}' },
                        background: { kind: 'color', color: '{color.surface}' },
                        color: '{color.text}',
                        border: { width: '1px', style: 'solid', color: '{color.border}' },
                        borderRadius: { all: '{radius.md}' },
                        fontWeight: 600,
                        fontSize: '{size.base}',
                        cursor: 'pointer',
                    },
                    hover: { opacity: 0.9, background: { kind: 'color', color: '{color.muted}' } },
                },
                children: [
                    {
                        id: 'icon',
                        kind: 'element',
                        tag: 'icon',
                        props: { name: 'Share2' },
                    },
                    {
                        id: 'label',
                        kind: 'element',
                        tag: 'text',
                        props: { text: 'Share Card' },
                    },
                ],
            },
        ],
    },
    designSchema: [],
    contentSchema: [],
    defaultDesign: {},
    defaultContent: {},
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
