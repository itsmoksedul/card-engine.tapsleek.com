"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'COPYRIGHT',
    label: 'Copyright',
    iconName: 'Type',
    group: 'system',
    description: 'Footer copyright text.',
    contentVersion: 1,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'text', label: 'Copyright text', kind: 'text', parentKey: 'root' },
    ],
    designSchema: [],
    contentSchema: [
        { key: 'text', type: 'text', label: 'Copyright text', default: '© 2026 TapSleek. All rights reserved.' },
    ],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: { t: '{space.4}', r: '{space.2}', b: '{space.4}', l: '{space.2}' },
                width: '100%',
            },
        },
        text: {
            base: {
                fontSize: '{size.xs}',
                color: '{color.muted}',
                textAlign: 'center',
            },
        },
    },
    defaultDesign: {},
    defaultContent: {
        text: '© 2026 TapSleek. All rights reserved.',
    },
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
