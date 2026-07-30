"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'APPOINTMENT',
    label: 'Booking',
    iconName: 'CalendarCheck',
    group: 'business',
    tier: 'PRO',
    description: 'Let people book a slot from one of your appointment profiles.',
    contentVersion: 1,
    interactive: true,
    references: [{ path: 'profileId', entity: 'appointmentProfile', as: 'profile' }],
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'title', label: 'Title', kind: 'text' },
        { key: 'description', label: 'Description', kind: 'text' },
        { key: 'meta', label: 'Duration row', kind: 'text' },
        { key: 'button', label: 'Book button', kind: 'button' },
    ],
    designSchema: [
        {
            key: 'mode', type: 'select', label: 'Mode',
            options: [
                { value: 'button', label: 'Button to booking page' },
                { value: 'inline', label: 'Inline booking widget' },
            ],
        },
        { key: 'showDuration', type: 'boolean', label: 'Show duration' },
    ],
    contentSchema: [
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        { key: 'description', type: 'textarea', label: 'Description', max: 200 },
        { key: 'profileId', type: 'reference', label: 'Appointment profile', entity: 'appointmentProfile', required: true },
        { key: 'buttonLabel', type: 'text', label: 'Button text', max: 40 },
    ],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.2}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.lg}' },
            },
        },
        title: {
            base: {
                fontFamily: '{font.heading}',
                fontSize: '{size.lg}',
                fontWeight: 700,
                color: '{color.text}',
            },
        },
        description: {
            base: { fontSize: '{size.sm}', lineHeight: 1.55, color: '{color.muted}' },
        },
        meta: {
            base: {
                alignSelf: 'flex-start',
                padding: { t: '{space.1}', r: '{space.3}', b: '{space.1}', l: '{space.3}' },
                background: { kind: 'color', color: '{color.bg}' },
                color: '{color.primary}',
                borderRadius: { all: '{radius.full}' },
                fontSize: '{size.xs}',
                fontWeight: 600,
            },
        },
        button: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '{space.2}',
                width: '100%',
                margin: { t: '{space.2}' },
                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                background: { kind: 'color', color: '{color.primary}' },
                color: '{color.onPrimary}',
                borderRadius: { all: '{radius.md}' },
                fontSize: '{size.sm}',
                fontWeight: 600,
                cursor: 'pointer',
                transition: { property: ['opacity'], duration: 150, easing: 'ease' },
            },
            hover: { opacity: 0.9 },
        },
    },
    defaultDesign: { mode: 'button', showDuration: true },
    defaultContent: { title: 'Book a meeting', description: '', profileId: null, buttonLabel: 'Choose a time' },
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        name: 'Container',
        style: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.2}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.lg}' },
            },
        },
        children: [
            {
                id: 'title',
                kind: 'element',
                tag: 'heading',
                name: 'Title',
                props: { level: 3 },
                bind: { source: 'self', path: 'title' },
                hideIfEmpty: true,
                style: {
                    base: { fontFamily: '{font.heading}', fontSize: '{size.lg}', fontWeight: 700, color: '{color.text}' },
                },
            },
            {
                id: 'description',
                kind: 'element',
                tag: 'text',
                name: 'Description',
                bind: { source: 'self', path: 'description' },
                hideIfEmpty: true,
                style: {
                    base: { fontSize: '{size.sm}', lineHeight: 1.55, color: '{color.muted}' },
                },
            },
            {
                id: 'button',
                kind: 'element',
                tag: 'button',
                name: 'Book button',
                bind: { source: 'self', path: 'buttonLabel' },
                props: { action: 'link' },
                style: {
                    base: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '{space.2}',
                        width: '100%',
                        margin: { t: '{space.2}' },
                        padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                        background: { kind: 'color', color: '{color.primary}' },
                        color: '{color.onPrimary}',
                        borderRadius: { all: '{radius.md}' },
                        fontSize: '{size.sm}',
                        fontWeight: 600,
                    },
                },
            },
        ],
    },
};
exports.previews = {
    empty: { title: '', description: '', profileId: null, buttonLabel: '' },
    typical: exports.meta.defaultContent,
    stress: { title: 'A'.repeat(60), description: 'D'.repeat(200), profileId: null, buttonLabel: 'B'.repeat(40) },
};
