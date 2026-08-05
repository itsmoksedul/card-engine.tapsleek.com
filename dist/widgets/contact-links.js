"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived: links stay a first-class DB entity because they carry per-link
 * click analytics (`CardLinkDailyStat`). The widget only decides how they look
 * and which categories appear.
 */
const links_1 = require("../catalog/links");
exports.meta = {
    type: 'CONTACT_LINKS',
    label: 'Link Buttons',
    iconName: 'Link2',
    group: 'system',
    description: 'Custom action & link buttons list.',
    contentVersion: 1,
    derived: true,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'list', label: 'List', kind: 'list', parentKey: 'root' },
        { key: 'item', label: 'Button', kind: 'button', parentKey: 'list' },
        { key: 'icon', label: 'Icon', kind: 'icon', parentKey: 'item' },
        { key: 'label', label: 'Label', kind: 'text', parentKey: 'item' },
        { key: 'value', label: 'Value', kind: 'text', parentKey: 'item' },
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
    contentSchema: [
        {
            key: 'links', type: 'repeater', label: 'Link Buttons', itemLabel: '{label}',
            fields: [
                { key: 'label', type: 'text', label: 'Label' },
                { key: 'url', type: 'url', label: 'URL' },
                {
                    key: 'type',
                    type: 'select',
                    label: 'Type',
                    options: links_1.LINK_CATALOG.map(l => ({ value: l.type, label: l.label }))
                }
            ]
        }
    ],
    defaultPartStyles: {
        root: { base: { display: 'flex', flexDirection: 'column' } },
        list: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
        item: {
            base: {
                display: 'flex',
                alignItems: 'center',
                gap: '{space.3}',
                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.md}' },
                color: '{color.text}',
                fontSize: '{size.base}',
                fontWeight: 500,
                cursor: 'pointer',
                transition: { property: ['background-color', 'transform'], duration: 150, easing: 'ease' },
            },
            hover: {
                background: { kind: 'color', color: '{color.bg}' },
                transform: { translateY: '-1px' },
            },
        },
        icon: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                flexShrink: 0,
                borderRadius: { all: '{radius.full}' },
                background: { kind: 'color', color: '{color.bg}' },
                color: '{color.link}',
            },
        },
        label: { base: { flexGrow: 1 } },
        value: { base: { fontSize: '{size.xs}', color: '{color.muted}' } },
    },
    defaultDesign: { layout: 'stack', showIcon: true, showValue: false, categories: [], max: 0 },
    defaultContent: {
        links: [
            { id: 'demo-1', type: 'phone', label: 'Phone', icon: 'Phone', url: 'tel:+1234567890' },
            { id: 'demo-2', type: 'whatsapp', label: 'WhatsApp', icon: 'SiWhatsapp', url: 'https://wa.me/1234567890' },
            { id: 'demo-3', type: 'email', label: 'Email', icon: 'AtSign', url: 'mailto:hello@example.com' },
        ]
    },
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        name: 'Container',
        style: { base: { display: 'flex', flexDirection: 'column', width: '100%' } },
        children: [
            {
                id: 'list',
                kind: 'element',
                tag: 'stack',
                name: 'List',
                style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
                children: [
                    {
                        id: 'item',
                        kind: 'element',
                        tag: 'link',
                        name: 'Button',
                        repeat: { source: 'self', path: 'links' },
                        bind: { source: 'self', path: 'url' },
                        props: { action: 'link' },
                        style: {
                            base: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '{space.3}',
                                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                                background: { kind: 'color', color: '{color.surface}' },
                                border: { width: '1px', style: 'solid', color: '{color.border}' },
                                borderRadius: { all: '{radius.md}' },
                                color: '{color.text}',
                                fontSize: '{size.base}',
                                fontWeight: 500,
                            },
                        },
                        children: [
                            {
                                id: 'icon',
                                kind: 'element',
                                tag: 'icon',
                                name: 'Icon',
                                bind: { source: 'self', path: 'icon' },
                                hideIfEmpty: true,
                                style: {
                                    base: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        flexShrink: 0,
                                        borderRadius: { all: '{radius.full}' },
                                        background: { kind: 'color', color: '{color.bg}' },
                                        color: '{color.primary}',
                                    },
                                },
                            },
                            {
                                id: 'label',
                                kind: 'element',
                                tag: 'text',
                                name: 'Label',
                                bind: { source: 'self', path: 'label' },
                                style: { base: { flexGrow: 1, fontWeight: 500 } },
                            },
                            {
                                id: 'value',
                                kind: 'element',
                                tag: 'text',
                                name: 'Value',
                                bind: { source: 'self', path: 'value' },
                                hideIfEmpty: true,
                                style: { base: { fontSize: '{size.xs}', color: '{color.muted}' } },
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
exports.previews = { empty: {}, typical: {}, stress: {} };
