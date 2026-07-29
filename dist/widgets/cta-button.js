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
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'button', label: 'Button', kind: 'button', parentKey: 'root' },
        { key: 'icon', label: 'Icon', kind: 'icon', parentKey: 'button' },
        { key: 'label', label: 'Label', kind: 'text', parentKey: 'button' },
        { key: 'caption', label: 'Caption', kind: 'text', parentKey: 'root' },
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
        { key: 'icon', type: 'icon', label: 'Icon', set: 'lucide' },
        { key: 'url', type: 'url', label: 'Link', required: true },
        { key: 'caption', type: 'text', label: 'Caption', max: 80 },
        { key: 'newTab', type: 'boolean', label: 'Open in a new tab' },
    ],
    defaultPartStyles: {
        root: {
            base: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '{space.2}' },
        },
        button: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '{space.2}',
                width: '100%',
                padding: { t: '{space.4}', r: '{space.5}', b: '{space.4}', l: '{space.5}' },
                background: { kind: 'color', color: '{color.primary}' },
                color: '{color.onPrimary}',
                borderRadius: { all: '{radius.md}' },
                fontSize: '{size.base}',
                fontWeight: 600,
                boxShadow: '{shadow.sm}',
                cursor: 'pointer',
                transition: { property: ['opacity', 'transform'], duration: 150, easing: 'ease' },
            },
            hover: { opacity: 0.9, transform: { translateY: '-1px' } },
        },
        icon: {
            base: { display: 'flex', alignItems: 'center', flexShrink: 0 },
        },
        // Inherits everything from the button; declared so the part shows as
        // styled in the inspector and has an obvious place to override.
        label: { base: { fontWeight: 600 } },
        caption: {
            base: { fontSize: '{size.xs}', color: '{color.muted}', textAlign: 'center' },
        },
    },
    defaultDesign: { fullWidth: true, showIcon: true, iconPosition: 'left' },
    defaultContent: { label: 'Book a call', url: '', icon: 'Calendar', caption: '', newTab: true },
};
exports.previews = {
    empty: { label: '', url: '' },
    typical: exports.meta.defaultContent,
    stress: { label: 'A'.repeat(40), url: 'https://example.com/' + 'x'.repeat(200), icon: 'Calendar', caption: 'B'.repeat(80), newTab: true },
};
