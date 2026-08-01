"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
const carousel_parts_1 = require("./carousel-parts");
exports.meta = {
    type: 'FAQ',
    label: 'FAQ',
    iconName: 'MessageCircleQuestion',
    group: 'content',
    description: 'Expandable question-and-answer list.',
    contentVersion: 1,
    interactive: true,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'title', label: 'Title', kind: 'text' },
        { key: 'list', label: 'List', kind: 'list' },
        { key: 'item', label: 'Item', kind: 'container' },
        { key: 'question', label: 'Question', kind: 'button' },
        { key: 'chevron', label: 'Chevron', kind: 'icon' },
        { key: 'answer', label: 'Answer', kind: 'text' },
        ...carousel_parts_1.carouselParts,
    ],
    designSchema: [
        { key: 'openFirst', type: 'boolean', label: 'Open the first item' },
        { key: 'singleOpen', type: 'boolean', label: 'Only one open at a time' },
        {
            key: 'marker', type: 'select', label: 'Marker',
            options: [
                { value: 'chevron', label: 'Chevron' },
                { value: 'plus', label: 'Plus / minus' },
                { value: 'none', label: 'None' },
            ],
        },
    ],
    contentSchema: [
        { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        {
            key: 'items', type: 'repeater', label: 'Questions', min: 1, max: 30, itemLabel: '{question}',
            fields: [
                { key: 'question', type: 'text', label: 'Question', required: true, max: 160 },
                { key: 'answer', type: 'textarea', label: 'Answer', required: true, max: 1200 },
            ],
        },
    ],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.3}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
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
        list: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
        item: {
            base: {
                border: { width: '1px', style: 'solid', color: '{color.border}' },
                borderRadius: { all: '{radius.md}' },
                overflow: 'hidden',
            },
        },
        question: {
            base: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '{space.3}',
                padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                fontSize: '{size.base}',
                fontWeight: 600,
                color: '{color.text}',
                cursor: 'pointer',
                userSelect: 'none',
            },
            hover: { background: { kind: 'color', color: '{color.bg}' } },
        },
        chevron: {
            base: {
                display: 'flex',
                flexShrink: 0,
                width: '16px',
                height: '16px',
                color: '{color.muted}',
                transition: { property: ['transform'], duration: 150, easing: 'ease' },
            },
        },
        answer: {
            base: {
                padding: { t: '0', r: '{space.4}', b: '{space.4}', l: '{space.4}' },
                fontSize: '{size.sm}',
                lineHeight: 1.6,
                color: '{color.muted}',
            },
        },
    },
    defaultDesign: { openFirst: true, singleOpen: true, marker: 'chevron' },
    defaultContent: {
        title: 'Frequently asked questions',
        items: [
            { question: 'What is your turnaround time?', answer: 'Most projects wrap in 2-3 weeks.' },
            { question: 'Do you offer ongoing support?', answer: 'Yes, retainer plans are available.' },
        ],
    },
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        name: 'Container',
        style: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.3}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
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
                id: 'list',
                kind: 'element',
                tag: 'stack',
                name: 'List',
                style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
                children: [
                    {
                        id: 'item',
                        kind: 'element',
                        tag: 'frame',
                        name: 'Item',
                        repeat: { source: 'self', path: 'items' },
                        style: {
                            base: {
                                border: { width: '1px', style: 'solid', color: '{color.border}' },
                                borderRadius: { all: '{radius.md}' },
                                overflow: 'hidden',
                            },
                        },
                        children: [
                            {
                                id: 'question',
                                kind: 'element',
                                tag: 'text',
                                name: 'Question',
                                bind: { source: 'self', path: 'question' },
                                style: {
                                    base: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '{space.3}',
                                        padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
                                        fontSize: '{size.base}',
                                        fontWeight: 600,
                                        color: '{color.text}',
                                    },
                                },
                            },
                            {
                                id: 'answer',
                                kind: 'element',
                                tag: 'text',
                                name: 'Answer',
                                bind: { source: 'self', path: 'answer' },
                                style: {
                                    base: {
                                        padding: { t: '0', r: '{space.4}', b: '{space.4}', l: '{space.4}' },
                                        fontSize: '{size.sm}',
                                        lineHeight: 1.6,
                                        color: '{color.muted}',
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
exports.previews = {
    empty: { title: '', items: [] },
    typical: exports.meta.defaultContent,
    stress: {
        title: 'A'.repeat(60),
        items: Array.from({ length: 30 }, () => ({ question: 'Q'.repeat(160), answer: 'A'.repeat(1200) })),
    },
};
