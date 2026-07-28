"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'SPACER',
    label: 'Spacer',
    iconName: 'MoveVertical',
    group: 'utility',
    description: 'Vertical empty space between blocks.',
    contentVersion: 1,
    parts: [{ key: 'root', label: 'Space', kind: 'container' }],
    designSchema: [
        {
            key: 'size', type: 'select', label: 'Height',
            options: [
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
            ],
        },
    ],
    contentSchema: [],
    defaultPartStyles: {
        root: { base: { height: '{space.6}' } },
    },
    defaultDesign: { size: 'md' },
    defaultContent: {},
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
