"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'DESCRIPTION',
    label: 'Description',
    iconName: 'AlignLeft',
    group: 'content',
    description: 'A paragraph of plain text.',
    contentVersion: 1,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'text', label: 'Text', kind: 'text' },
    ],
    designSchema: [
        {
            key: 'align', type: 'select', label: 'Alignment',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
            ],
        },
    ],
    contentSchema: [{ key: 'text', type: 'textarea', label: 'Text', max: 600 }],
    defaultPartStyles: {
        root: { base: { display: 'flex', flexDirection: 'column' } },
        text: {
            base: { fontSize: '{size.base}', lineHeight: 1.6, color: '{color.muted}' },
        },
    },
    defaultDesign: { align: 'left' },
    defaultContent: { text: 'Tell people a little about what you do.' },
};
exports.previews = {
    empty: { text: '' },
    typical: exports.meta.defaultContent,
    stress: { text: 'Lorem ipsum dolor sit amet. '.repeat(30) },
};
