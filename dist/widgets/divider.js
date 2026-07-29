"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'DIVIDER',
    label: 'Divider',
    iconName: 'Minus',
    group: 'utility',
    description: 'A horizontal rule between blocks.',
    contentVersion: 1,
    contentSchema: [],
    defaultDesign: { style: 'solid' },
    defaultContent: {},
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        style: {
            base: {
                display: 'flex',
                alignItems: 'center',
                padding: { t: '{space.2}', b: '{space.2}' },
            },
        },
        children: [
            {
                id: 'line',
                kind: 'element',
                tag: 'divider',
                style: {
                    base: {
                        width: '100%',
                        height: '1px',
                        background: { kind: 'color', color: '{color.border}' },
                    },
                },
            }
        ]
    },
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
