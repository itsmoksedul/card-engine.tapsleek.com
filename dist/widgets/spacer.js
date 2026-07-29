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
    contentSchema: [],
    defaultDesign: { size: 'md' },
    defaultContent: {},
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'spacer',
        style: {
            base: { height: '{space.6}' },
        },
    },
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
