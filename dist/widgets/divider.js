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
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'line', label: 'Line', kind: 'container' },
    ],
    designSchema: [
        {
            key: 'style', type: 'select', label: 'Style',
            options: [
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
            ],
        },
    ],
    contentSchema: [],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                alignItems: 'center',
                padding: { t: '{space.2}', b: '{space.2}' },
            },
        },
        line: {
            base: {
                width: '100%',
                height: '1px',
                background: { kind: 'color', color: '{color.border}' },
            },
        },
    },
    defaultDesign: { style: 'solid' },
    defaultContent: {},
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
