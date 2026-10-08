"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'MAP',
    label: 'Map',
    iconName: 'MapPin',
    group: 'business',
    description: 'Embed a Google Map based on an address.',
    contentVersion: 1,
    interactive: true,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'label', label: 'Label', kind: 'text' },
        { key: 'address', label: 'Address Text', kind: 'text' },
        { key: 'mapWrapper', label: 'Map Wrapper', kind: 'container' },
        { key: 'directionsBtn', label: 'Directions Button', kind: 'button' },
    ],
    // A real layout tree so every piece is its own layer in the builder (hide,
    // duplicate, wrap, delete). Node ids match the part keys above, so styles
    // saved against the old `.p-<part>` classes keep applying; the base styles
    // stay in `defaultPartStyles`, like CTA_BUTTON.
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        children: [
            {
                id: 'label',
                kind: 'element',
                tag: 'text',
                name: 'Label',
                hideIfEmpty: true,
                bind: { source: 'self', path: 'label' },
            },
            {
                id: 'address',
                kind: 'element',
                tag: 'text',
                name: 'Address',
                hideIfEmpty: true,
                bind: { source: 'self', path: 'address', format: 'mapAddress' },
            },
            {
                id: 'mapWrapper',
                kind: 'element',
                tag: 'embed',
                name: 'Map',
                hideIfEmpty: true,
                bind: { source: 'self', path: 'address', format: 'mapEmbed' },
            },
            {
                id: 'directionsBtn',
                kind: 'element',
                tag: 'link',
                name: 'Directions Button',
                hideIfEmpty: true,
                props: { target: '_blank', rel: 'noopener noreferrer' },
                bind: { source: 'self', path: 'address', format: 'mapDirectionsUrl' },
                children: [
                    {
                        id: 'icon',
                        kind: 'element',
                        tag: 'icon',
                        props: { name: 'Navigation' },
                    },
                    {
                        id: 'directionsText',
                        kind: 'element',
                        tag: 'text',
                        props: { text: 'Get Directions' },
                    },
                ],
            },
        ],
    },
    designSchema: [
        {
            key: 'height', type: 'select', label: 'Map Height',
            options: [
                { value: 'sm', label: 'Small (200px)' },
                { value: 'md', label: 'Medium (300px)' },
                { value: 'lg', label: 'Large (450px)' },
            ],
        },
        {
            key: 'mapType', type: 'select', label: 'Map Type',
            options: [
                { value: 'm', label: 'Roadmap' },
                { value: 'k', label: 'Satellite' },
            ],
        },
        { key: 'showAddress', type: 'boolean', label: 'Show text address above map' },
        { key: 'showDirectionsBtn', type: 'boolean', label: 'Show "Get Directions" button' },
    ],
    contentSchema: [
        { key: 'label', type: 'text', label: 'Label', max: 60 },
        { key: 'address', type: 'text', label: 'Address to Display' },
    ],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.3}',
                background: { kind: 'color', color: '{color.surface}' },
                borderRadius: { all: '{radius.lg}' }
            }
        },
        label: {
            base: {
                fontSize: '{size.sm}',
                fontWeight: 600,
                color: '{color.primary}',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }
        },
        address: {
            base: {
                fontSize: '{size.base}',
                color: '{color.text}',
                fontWeight: 500
            }
        },
        mapWrapper: {
            base: {
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: { all: '{radius.md}' },
                background: { kind: 'color', color: '{color.border}' }
            }
        },
        directionsBtn: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '{space.2}',
                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                background: { kind: 'color', color: '{color.primary}' },
                color: '{color.surface}',
                borderRadius: { all: '{radius.full}' },
                fontWeight: 600,
                margin: { t: '{space.2}' },
                textDecoration: 'none',
                transition: { property: ['background-color', 'transform'], duration: 150, easing: 'ease' }
            }
        }
    },
    defaultDesign: { height: 'md', mapType: 'm', showAddress: true, showDirectionsBtn: true },
    defaultContent: {
        label: 'Location',
        address: 'Times Square, New York, NY',
    }
};
exports.previews = {
    empty: { label: '', address: '' },
    typical: exports.meta.defaultContent,
    stress: { label: 'A'.repeat(60), address: '123 Very Long Address String That Keeps Going St, Suite 400, Floor 99, Some City, Some State 12345' }
};
