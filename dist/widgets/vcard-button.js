"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'VCARD_BUTTON',
    label: 'Save Contact',
    iconName: 'UserPlus',
    group: 'system',
    description: 'A button that downloads the card as a vCard (.vcf).',
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
                tag: 'link',
                props: { action: 'vcard' },
                bind: { source: 'card', field: 'vcardUrl' },
                style: {
                    base: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '{space.2}',
                        padding: { t: '{space.3}', r: '{space.6}', b: '{space.3}', l: '{space.6}' },
                        background: { kind: 'color', color: '{color.primary}' },
                        color: '{color.surface}',
                        borderRadius: { all: '{radius.md}' },
                        fontWeight: 600,
                        fontSize: '{size.base}',
                        cursor: 'pointer',
                    },
                    hover: { opacity: 0.9 },
                },
                children: [
                    {
                        id: 'icon',
                        kind: 'element',
                        tag: 'icon',
                        props: { name: 'Download' },
                    },
                    {
                        id: 'label',
                        kind: 'element',
                        tag: 'text',
                        props: { text: 'Save Contact' },
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
