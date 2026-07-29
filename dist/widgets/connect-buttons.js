"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'CONNECT_BUTTONS',
    label: 'Connect Buttons',
    iconName: 'MousePointerClick',
    group: 'system',
    description: 'Two action buttons: Save Contact and Connect Now.',
    contentVersion: 1,
    derived: true,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'saveContact', label: 'Save Contact button', kind: 'button', parentKey: 'root' },
        { key: 'connectNow', label: 'Connect Now button', kind: 'button', parentKey: 'root' },
    ],
    designSchema: [
        { key: 'showSaveContact', type: 'boolean', label: 'Show Save Contact button' },
        { key: 'showConnectNow', type: 'boolean', label: 'Show Connect Now button' },
    ],
    contentSchema: [],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.3}',
                width: '100%',
                padding: { t: '{space.2}', r: '0', b: '{space.2}', l: '0' },
            },
        },
        saveContact: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '{space.2}',
                width: '100%',
                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                background: { kind: 'color', color: '{color.primary}' },
                color: '{color.onPrimary}',
                borderRadius: { all: '{radius.md}' },
                fontSize: '{size.sm}',
                fontWeight: 600,
                cursor: 'pointer',
                transition: { property: ['opacity'], duration: 150, easing: 'ease' },
            },
            hover: { opacity: 0.88 },
        },
        connectNow: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '{space.2}',
                width: '100%',
                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                color: '{color.text}',
                borderRadius: { all: '{radius.md}' },
                fontSize: '{size.sm}',
                fontWeight: 600,
                cursor: 'pointer',
                transition: { property: ['background-color'], duration: 150, easing: 'ease' },
            },
        },
    },
    defaultDesign: {
        showSaveContact: true,
        showConnectNow: true,
    },
    defaultContent: {},
    defaultLayout: {
        kind: "element",
        id: "root",
        tag: "stack",
        name: "Connect Buttons",
        style: {
            base: {
                display: "flex",
                flexDirection: "row",
                gap: "{space.3}",
                width: "100%",
            },
        },
        children: [
            {
                kind: "element",
                id: "saveContact",
                tag: "button",
                name: "Save Contact",
                props: { label: "Save Contact", action: "vcard" },
                style: {
                    base: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: { t: "{space.3}", b: "{space.3}", r: "{space.4}", l: "{space.4}" },
                        background: { kind: "color", color: "{color.primary}" },
                        color: "{color.onPrimary}",
                        borderRadius: { all: "{radius.md}" },
                        fontWeight: 600,
                        cursor: "pointer",
                    },
                },
            },
            {
                kind: "element",
                id: "connectNow",
                tag: "button",
                name: "Connect Now",
                props: { label: "Connect Now", action: "link" },
                style: {
                    base: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: { t: "{space.3}", b: "{space.3}", r: "{space.4}", l: "{space.4}" },
                        background: { kind: "color", color: "{color.surface}" },
                        border: { width: "1px", style: "solid", color: "{color.border}" },
                        color: "{color.text}",
                        borderRadius: { all: "{radius.md}" },
                        fontWeight: 600,
                        cursor: "pointer",
                    },
                },
            },
        ],
    },
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
