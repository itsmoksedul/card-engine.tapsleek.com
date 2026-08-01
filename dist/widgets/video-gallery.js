"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
const carousel_parts_1 = require("./carousel-parts");
exports.meta = {
    type: 'VIDEO_GALLERY',
    label: 'Video Gallery',
    iconName: 'Clapperboard',
    group: 'media',
    description: 'A grid or list of videos. Click to play.',
    contentVersion: 1,
    interactive: true,
    parts: [
        { key: 'root', label: 'Container', kind: 'container' },
        { key: 'title', label: 'Gallery Title', kind: 'text' },
        { key: 'grid', label: 'Grid Layout', kind: 'list' },
        { key: 'item', label: 'Video Item', kind: 'button' },
        { key: 'thumbnail', label: 'Thumbnail', kind: 'image' },
        { key: 'playIcon', label: 'Play Icon', kind: 'icon' },
        { key: 'caption', label: 'Caption', kind: 'text' },
        ...carousel_parts_1.carouselParts,
    ],
    designSchema: [
        {
            key: 'layout', type: 'select', label: 'Layout',
            options: [
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'Vertical List' },
            ],
        },
        {
            key: 'columns', type: 'select', label: 'Columns (Grid only)',
            visibleIf: { key: 'layout', equals: 'grid' },
            options: [
                { value: '2', label: '2 Columns' },
                { value: '3', label: '3 Columns' },
            ],
        },
        {
            key: 'aspectRatio', type: 'select', label: 'Thumbnail Aspect Ratio',
            options: [
                { value: '16/9', label: '16:9 Widescreen' },
                { value: '4/3', label: '4:3 Standard' },
                { value: '1/1', label: '1:1 Square' },
                { value: '9/16', label: '9:16 Vertical' },
            ],
        },
    ],
    contentSchema: [
        { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },
        { key: 'title', type: 'text', label: 'Gallery Title', max: 60 },
        {
            key: 'videos', type: 'repeater', label: 'Videos', itemLabel: '{caption}',
            fields: [
                { key: 'url', type: 'url', label: 'Video URL' },
                { key: 'caption', type: 'text', label: 'Caption', max: 100 },
                { key: 'thumbnail', type: 'image', label: 'Custom Thumbnail (Optional)' },
            ]
        }
    ],
    defaultPartStyles: {
        root: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.4}',
                padding: { all: '{space.4}' },
                background: { kind: 'color', color: '{color.surface}' },
                borderRadius: { all: '{radius.lg}' }
            }
        },
        title: {
            base: {
                fontFamily: '{font.heading}',
                fontSize: '{size.lg}',
                fontWeight: 700,
                color: '{color.text}',
            }
        },
        grid: {
            base: {
                display: 'grid',
                gap: '{space.3}'
            }
        },
        item: {
            base: {
                display: 'flex',
                flexDirection: 'column',
                gap: '{space.2}',
                position: 'relative',
                cursor: 'pointer',
                transition: { property: ['transform'], duration: 150, easing: 'ease' }
            },
            hover: {
                transform: { translateY: '-2px' }
            }
        },
        thumbnail: {
            base: {
                width: '100%',
                objectFit: 'cover',
                borderRadius: { all: '{radius.md}' },
                background: { kind: 'color', color: '{color.border}' }
            }
        },
        playIcon: {
            base: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: { translateX: '-50%', translateY: '-50%' },
                width: '40px',
                height: '40px',
                color: '#ffffff',
                background: { kind: 'color', color: 'rgba(0,0,0,0.5)' },
                borderRadius: { all: '{radius.full}' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropBlur: '{blur.sm}'
            }
        },
        caption: {
            base: {
                fontSize: '{size.sm}',
                color: '{color.text}',
                fontWeight: 500
            }
        },
        ...carousel_parts_1.carouselDefaultPartStyles,
    },
    defaultDesign: { layout: 'grid', columns: '2', aspectRatio: '16/9' },
    defaultContent: {
        useCarousel: false,
        title: 'Featured Videos',
        videos: [
            { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Demo Showcase Video', thumbnail: '' }
        ]
    },
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'stack',
        name: 'Container',
        style: {
            base: { display: 'flex', flexDirection: 'column', gap: '{space.3}', width: '100%' },
        },
        children: [
            {
                id: 'title',
                kind: 'element',
                tag: 'heading',
                name: 'Gallery Title',
                props: { level: 3 },
                bind: { source: 'self', path: 'title' },
                hideIfEmpty: true,
                style: {
                    base: { fontFamily: '{font.heading}', fontSize: '{size.lg}', fontWeight: 700, color: '{color.text}' },
                },
            },
            {
                id: 'grid',
                kind: 'element',
                tag: 'grid',
                name: 'Grid Layout',
                visibleIf: { key: 'useCarousel', equals: false },
                style: { base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '{space.3}' } },
                children: [
                    {
                        id: 'item',
                        kind: 'element',
                        tag: 'frame',
                        name: 'Video Item',
                        repeat: { source: 'self', path: 'videos' },
                        style: {
                            base: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '{space.1}',
                                overflow: 'hidden',
                                borderRadius: { all: '{radius.md}' },
                            },
                        },
                        children: [
                            {
                                id: 'thumbnail',
                                kind: 'element',
                                tag: 'image',
                                name: 'Thumbnail',
                                bind: { source: 'self', path: 'thumbnail' },
                                style: {
                                    base: { width: '100%', aspectRatio: '16/9', objectFit: 'cover' },
                                },
                            },
                            {
                                id: 'caption',
                                kind: 'element',
                                tag: 'text',
                                name: 'Caption',
                                bind: { source: 'self', path: 'caption' },
                                hideIfEmpty: true,
                                style: {
                                    base: { fontSize: '{size.xs}', fontWeight: 500, color: '{color.text}' },
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "carouselRoot",
                kind: "element",
                tag: "stack",
                name: "Carousel Container",
                visibleIf: { key: "useCarousel", equals: true },
                style: { base: { position: "relative", display: "flex", flexDirection: "column", gap: "{space.4}" } },
                children: [
                    {
                        id: 'carouselTrack',
                        kind: 'element',
                        tag: 'carousel',
                        name: 'Carousel Track',
                        children: [
                            {
                                id: 'c_item',
                                kind: 'element',
                                tag: 'frame',
                                name: 'Video Item',
                                repeat: { source: 'self', path: 'videos' },
                                style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.1}', overflow: 'hidden', borderRadius: { all: '{radius.md}' } } },
                                children: [
                                    { id: 'c_thumbnail', kind: 'element', tag: 'image', name: 'Thumbnail', bind: { source: 'self', path: 'thumbnail' }, style: { base: { width: '100%', aspectRatio: '16/9', objectFit: 'cover' } } },
                                    { id: 'c_caption', kind: 'element', tag: 'text', name: 'Caption', bind: { source: 'self', path: 'caption' }, hideIfEmpty: true, style: { base: { fontSize: '{size.xs}', fontWeight: 500, color: '{color.text}' } } },
                                ]
                            }
                        ]
                    },
                    {
                        id: "carouselArrows",
                        kind: "element",
                        tag: "frame",
                        name: "Arrows",
                        visibleIf: { key: "showArrows", equals: true },
                        children: [
                            { id: "arrowPrev", kind: "element", tag: "button", name: "Prev Arrow", props: { action: "carousel-prev" }, style: { base: { position: "absolute", left: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10, width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" }, border: { style: "solid", width: "1px", color: "{color.border}" }, boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer" } }, children: [{ id: "iconPrev", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronLeft" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }] },
                            { id: "arrowNext", kind: "element", tag: "button", name: "Next Arrow", props: { action: "carousel-next" }, style: { base: { position: "absolute", right: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10, width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" }, border: { style: "solid", width: "1px", color: "{color.border}" }, boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer" } }, children: [{ id: "iconNext", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronRight" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }] }
                        ]
                    },
                    {
                        id: "carouselDots",
                        kind: "element",
                        tag: "stack",
                        name: "Pagination",
                        visibleIf: { key: "showDots", equals: true },
                        style: { base: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "{space.2}", margin: { t: "{space.2}" } } },
                        children: [
                            { id: "dot", kind: "element", tag: "button", name: "Dot", repeat: { source: "self", path: "videos" }, props: { action: "carousel-dot" }, style: { base: { width: "8px", height: "8px", borderRadius: { all: "50%" }, background: { kind: "color", color: "{color.border}" }, cursor: "pointer", padding: { all: "0" }, border: { style: "none", width: "0" } } } }
                        ]
                    }
                ]
            },
        ],
    },
};
exports.previews = {
    empty: { title: '', videos: [] },
    typical: exports.meta.defaultContent,
    stress: { title: 'A'.repeat(100), videos: Array(6).fill({ url: '#', caption: 'A'.repeat(100) }) }
};
