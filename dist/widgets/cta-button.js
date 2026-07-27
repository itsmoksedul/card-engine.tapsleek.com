"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'CTA_BUTTON',
    label: 'Button',
    iconName: 'MousePointerClick',
    group: 'utility',
    description: 'A single call-to-action button.',
    contentVersion: 1,
    parts: [
        { key: 'root', label: 'Container' },
        { key: 'button', label: 'Button' },
        { key: 'icon', label: 'Icon' },
        { key: 'label', label: 'Label' },
        { key: 'caption', label: 'Caption' },
    ],
    designSchema: [
        { key: 'fullWidth', type: 'boolean', label: 'Full width' },
        { key: 'showIcon', type: 'boolean', label: 'Show icon' },
        {
            key: 'iconPosition', type: 'select', label: 'Icon position',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
            ],
            visibleIf: { key: 'showIcon', equals: true },
        },
    ],
    contentSchema: [
        { key: 'label', type: 'text', label: 'Button text', required: true, max: 40 },
        { key: 'url', type: 'url', label: 'Link', required: true },
        { key: 'icon', type: 'icon', label: 'Icon', set: 'lucide' },
        { key: 'caption', type: 'text', label: 'Caption', max: 80 },
        { key: 'newTab', type: 'boolean', label: 'Open in a new tab' },
    ],
    defaultDesign: { fullWidth: true, showIcon: true, iconPosition: 'left' },
    defaultContent: { label: 'Book a call', url: '', icon: 'Calendar', caption: '', newTab: true },
};
exports.previews = {
    empty: { label: '', url: '' },
    typical: exports.meta.defaultContent,
    stress: { label: 'A'.repeat(40), url: 'https://example.com/' + 'x'.repeat(200), icon: 'Calendar', caption: 'B'.repeat(80), newTab: true },
};
