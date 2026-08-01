"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
const carousel_parts_1 = require("./carousel-parts");
exports.meta = {
    type: "GALLERY",
    label: "Gallery",
    iconName: "Images",
    group: "media",
    description: "A set of images.",
    contentVersion: 1,
    interactive: true,
    parts: [
        { key: "root", label: "Container", kind: "container" },
        { key: "title", label: "Title", kind: "text" },
        { key: "list", label: "Grid", kind: "list" },
        { key: "item", label: "Image wrapper", kind: "container" },
        { key: "image", label: "Image", kind: "image" },
        { key: "caption", label: "Caption", kind: "text" },
        ...carousel_parts_1.carouselParts,
    ],
    designSchema: [
        {
            key: "layout",
            type: "select",
            label: "Layout",
            options: [
                { value: "grid-2", label: "2 columns" },
                { value: "grid-3", label: "3 columns" },
                { value: "masonry", label: "Masonry" },
            ],
        },
        {
            key: "ratio",
            type: "select",
            label: "Image ratio",
            options: [
                { value: "1/1", label: "Square" },
                { value: "4/3", label: "4:3" },
                { value: "3/4", label: "3:4" },
                { value: "16/9", label: "16:9" },
                { value: "auto", label: "Original" },
            ],
        },
        { key: "showCaption", type: "boolean", label: "Show captions" },
        { key: "lightbox", type: "boolean", label: "Open full size on tap" },
        { key: "useCarousel", type: "boolean", label: "Enable Carousel" },
        { key: "showArrows", type: "boolean", label: "Show Arrows", visibleIf: { key: "useCarousel", equals: true } },
        { key: "showDots", type: "boolean", label: "Show Pagination", visibleIf: { key: "useCarousel", equals: true } },
    ],
    contentSchema: [
        { key: "title", type: "text", label: "Title", max: 60 },
        {
            key: "items",
            type: "repeater",
            label: "Images",
            max: 40,
            itemLabel: "{caption}",
            layout: "gallery",
            fields: [
                { key: "url", type: "image", label: "Image", required: true, maxMB: 5 },
                { key: "caption", type: "text", label: "Caption", max: 80 },
                { key: "link", type: "url", label: "Link" },
            ],
        },
    ],
    defaultPartStyles: {
        root: {
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "{space.3}",
                padding: { all: "{space.4}" },
                background: { kind: "color", color: "{color.surface}" },
                borderRadius: { all: "{radius.lg}" },
            },
        },
        title: {
            base: {
                fontFamily: "{font.heading}",
                fontSize: "{size.lg}",
                fontWeight: 700,
                color: "{color.text}",
            },
        },
        list: {
            base: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "{space.2}",
            },
        },
        item: {
            base: {
                position: "relative",
                overflow: "hidden",
                borderRadius: { all: "{radius.md}" },
            },
        },
        image: {
            base: {
                width: "100%",
                aspectRatio: "1/1",
                objectFit: "cover",
                transition: { property: ["transform"], duration: 250, easing: "ease" },
            },
            hover: { transform: { scale: 1.04 } },
        },
        caption: {
            base: {
                padding: { t: "{space.2}" },
                fontSize: "{size.xs}",
                color: "{color.muted}",
            },
        },
    },
    defaultDesign: {
        layout: "grid-2",
        ratio: "1/1",
        showCaption: false,
        lightbox: true,
        useCarousel: false,
        showArrows: true,
        showDots: true,
    },
    defaultContent: {
        title: "Gallery",
        items: [
            { url: "", caption: "Abstract shape" },
            { url: "", caption: "Gallery artwork" },
        ],
    },
    defaultLayout: {
        id: "root",
        kind: "element",
        tag: "stack",
        name: "Container",
        style: {
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "{space.3}",
                padding: { all: "{space.4}" },
                background: { kind: "color", color: "{color.surface}" },
                borderRadius: { all: "{radius.lg}" },
            },
        },
        children: [
            {
                id: "title",
                kind: "element",
                tag: "heading",
                name: "Title",
                props: { level: 3 },
                bind: { source: "self", path: "title" },
                hideIfEmpty: true,
                style: {
                    base: {
                        fontFamily: "{font.heading}",
                        fontSize: "{size.lg}",
                        fontWeight: 700,
                        color: "{color.text}",
                    },
                },
            },
            {
                id: "list",
                kind: "element",
                tag: "grid",
                name: "Grid",
                visibleIf: { key: "useCarousel", equals: false },
                style: {
                    base: {
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "{space.2}",
                    },
                },
                children: [
                    {
                        id: "item",
                        kind: "element",
                        tag: "frame",
                        name: "Image wrapper",
                        repeat: { source: "self", path: "items" },
                        style: {
                            base: {
                                overflow: "hidden",
                                borderRadius: { all: "{radius.md}" },
                            },
                        },
                        children: [
                            {
                                id: "image",
                                kind: "element",
                                tag: "image",
                                name: "Image",
                                bind: { source: "self", path: "url" },
                                style: {
                                    base: {
                                        width: "100%",
                                        aspectRatio: "1/1",
                                        objectFit: "cover",
                                    },
                                },
                            },
                            {
                                id: "caption",
                                kind: "element",
                                tag: "text",
                                name: "Caption",
                                bind: { source: "self", path: "caption" },
                                hideIfEmpty: true,
                                style: {
                                    base: {
                                        fontSize: "{size.xs}",
                                        color: "{color.muted}",
                                        padding: { t: "{space.1}" },
                                    },
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
                style: {
                    base: { position: "relative", display: "flex", flexDirection: "column", gap: "{space.4}" },
                },
                children: [
                    {
                        id: "carouselTrack",
                        kind: "element",
                        tag: "carousel",
                        name: "Carousel Track",
                        children: [
                            {
                                id: "carouselItem",
                                kind: "element",
                                tag: "frame",
                                name: "Carousel Item",
                                repeat: { source: "self", path: "items" },
                                style: {
                                    base: { overflow: "hidden", borderRadius: { all: "{radius.md}" } },
                                },
                                children: [
                                    {
                                        id: "image",
                                        kind: "element",
                                        tag: "image",
                                        name: "Image",
                                        bind: { source: "self", path: "url" },
                                        style: {
                                            base: { width: "100%", aspectRatio: "1/1", objectFit: "cover" },
                                        },
                                    },
                                    {
                                        id: "caption",
                                        kind: "element",
                                        tag: "text",
                                        name: "Caption",
                                        bind: { source: "self", path: "caption" },
                                        hideIfEmpty: true,
                                        style: {
                                            base: { fontSize: "{size.xs}", color: "{color.muted}", padding: { t: "{space.1}" } },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: "carouselArrows",
                        kind: "element",
                        tag: "frame",
                        name: "Arrows",
                        visibleIf: { key: "showArrows", equals: true },
                        children: [
                            {
                                id: "arrowPrev",
                                kind: "element",
                                tag: "button",
                                name: "Prev Arrow",
                                props: { action: "carousel-prev" },
                                style: {
                                    base: {
                                        position: "absolute", left: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10,
                                        width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                                        background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" },
                                        border: { style: "solid", width: "1px", color: "{color.border}" },
                                        boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer",
                                    },
                                },
                                children: [
                                    { id: "iconPrev", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronLeft" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }
                                ]
                            },
                            {
                                id: "arrowNext",
                                kind: "element",
                                tag: "button",
                                name: "Next Arrow",
                                props: { action: "carousel-next" },
                                style: {
                                    base: {
                                        position: "absolute", right: "{space.2}", top: "50%", transform: { translateY: "-50%" }, zIndex: 10,
                                        width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                                        background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" },
                                        border: { style: "solid", width: "1px", color: "{color.border}" },
                                        boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer",
                                    },
                                },
                                children: [
                                    { id: "iconNext", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronRight" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }
                                ]
                            }
                        ]
                    },
                    {
                        id: "carouselDots",
                        kind: "element",
                        tag: "stack",
                        name: "Pagination",
                        visibleIf: { key: "showDots", equals: true },
                        style: {
                            base: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "{space.2}", margin: { t: "{space.2}" } },
                        },
                        children: [
                            {
                                id: "dot",
                                kind: "element",
                                tag: "button",
                                name: "Dot",
                                repeat: { source: "self", path: "items" },
                                props: { action: "carousel-dot" },
                                style: {
                                    base: { width: "8px", height: "8px", borderRadius: { all: "50%" }, background: { kind: "color", color: "{color.border}" }, cursor: "pointer", padding: { all: "0" }, border: { style: "none", width: "0" } },
                                },
                            }
                        ]
                    }
                ],
            },
        ],
    },
};
exports.previews = {
    empty: { title: "", items: [] },
    typical: {
        title: "Our work",
        items: [
            { url: "https://cdn.tapsleek.com/demo/1.jpg", caption: "", link: "" },
        ],
    },
    stress: {
        title: "A".repeat(60),
        items: Array.from({ length: 40 }, (_, i) => ({
            url: `https://cdn.tapsleek.com/demo/${i}.jpg`,
            caption: "C".repeat(80),
            link: "",
        })),
    },
};
