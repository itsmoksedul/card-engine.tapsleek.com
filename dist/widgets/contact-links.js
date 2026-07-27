"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'CONTACT_LINKS',
    label: 'Contact Buttons',
    iconName: 'Link2',
    group: 'contact',
    description: 'The links from the card’s Links tab.',
    contentVersion: 1,
    derived: true,
    parts: [
        { key: 'root', label: 'Container' },
        { key: 'list', label: 'List' },
        { key: 'item', label: 'Button' },
        { key: 'icon', label: 'Icon' },
        { key: 'label', label: 'Label' },
        { key: 'value', label: 'Value' },
    ],
    designSchema: [
        {
            key: 'layout', type: 'select', label: 'Layout',
            options: [
                { value: 'stack', label: 'Full-width buttons' },
                { value: 'grid-2', label: '2 columns' },
                { value: 'grid-3', label: '3 columns' },
                { value: 'icons', label: 'Icons only' },
            ],
        },
        { key: 'showIcon', type: 'boolean', label: 'Show icon' },
        { key: 'showValue', type: 'boolean', label: 'Show value under label' },
        {
            key: 'categories', type: 'select', label: 'Include categories', multiple: true,
            options: [
                { value: 'CONTACT', label: 'Contact' },
                { value: 'BUSINESS', label: 'Business' },
                { value: 'SOCIAL_MEDIA', label: 'Social' },
                { value: 'PAYMENT', label: 'Payment' },
                { value: 'MUSIC', label: 'Music' },
                { value: 'OTHER', label: 'Other' },
            ],
            hint: 'Leave empty to include every link.',
        },
        { key: 'max', type: 'number', label: 'Maximum links', min: 0, max: 50 },
    ],
    contentSchema: [],
    defaultDesign: { layout: 'stack', showIcon: true, showValue: false, categories: [], max: 0 },
    defaultContent: {},
};
exports.previews = { empty: {}, typical: {}, stress: {} };
