"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: "TEAM",
    label: "Team",
    iconName: "Users",
    group: "business",
    description: "A grid of team members with photos and roles.",
    contentVersion: 1,
    defaultLayout: {
        id: "root",
        kind: "element",
        tag: "stack",
        style: {
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "{space.4}",
                padding: { all: "{space.4}" },
                background: { kind: "color", color: "{color.surface}" },
                borderRadius: { all: "{radius.lg}" },
            },
        },
        children: [
            {
                id: "heading",
                kind: "element",
                tag: "heading",
                props: { level: 3 },
                hideIfEmpty: true,
                bind: { source: "self", path: "heading" },
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
                visibleIf: { key: "useCarousel", equals: false },
                style: {
                    base: {
                        display: "grid",
                        gap: "{space.4}",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    },
                },
                children: [
                    {
                        id: "item",
                        kind: "element",
                        tag: "stack",
                        repeat: { source: "self", path: "items" },
                        style: {
                            base: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "{space.3}",
                                padding: { all: "{space.3}" },
                                alignItems: "center",
                            },
                        },
                        children: [
                            {
                                id: "avatar",
                                kind: "element",
                                tag: "image",
                                bind: { source: "self", path: "image" },
                                hideIfEmpty: true,
                                style: {
                                    base: {
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        borderRadius: { all: "{radius.full}" },
                                    },
                                },
                            },
                            {
                                id: "content",
                                kind: "element",
                                tag: "stack",
                                style: {
                                    base: {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "{space.1}",
                                        alignItems: "center",
                                        textAlign: "center",
                                    },
                                },
                                children: [
                                    {
                                        id: "name",
                                        kind: "element",
                                        tag: "text",
                                        bind: { source: "self", path: "name" },
                                        style: {
                                            base: {
                                                fontSize: "{size.base}",
                                                fontWeight: 600,
                                                color: "{color.text}",
                                            },
                                        },
                                    },
                                    {
                                        id: "role",
                                        kind: "element",
                                        tag: "text",
                                        hideIfEmpty: true,
                                        bind: { source: "self", path: "role" },
                                        style: {
                                            base: {
                                                fontSize: "{size.sm}",
                                                fontWeight: 500,
                                                color: "{color.primary}",
                                            },
                                        },
                                    },
                                    {
                                        id: "bio",
                                        kind: "element",
                                        tag: "text",
                                        hideIfEmpty: true,
                                        bind: { source: "self", path: "bio" },
                                        style: {
                                            base: {
                                                fontSize: "{size.sm}",
                                                color: "{color.muted}",
                                                lineHeight: 1.4,
                                            },
                                        },
                                    },
                                ],
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
                                name: "Team Member",
                                repeat: { source: "self", path: "items" },
                                style: {
                                    base: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "{space.3}", padding: { all: "{space.3}" }, background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "{radius.lg}" }, border: { style: "solid", width: "1px", color: "{color.border}" } },
                                },
                                children: [
                                    {
                                        id: "image",
                                        kind: "element",
                                        tag: "image",
                                        name: "Photo",
                                        bind: { source: "self", path: "image" },
                                        style: { base: { width: "80px", height: "80px", borderRadius: { all: "50%" }, objectFit: "cover" } },
                                    },
                                    {
                                        id: "info",
                                        kind: "element",
                                        tag: "stack",
                                        name: "Info",
                                        style: { base: { display: "flex", flexDirection: "column", gap: "{space.1}" } },
                                        children: [
                                            { id: "name", kind: "element", tag: "heading", name: "Name", props: { level: 4 }, bind: { source: "self", path: "name" }, style: { base: { fontSize: "{size.base}", fontWeight: 600, color: "{color.text}" } } },
                                            { id: "role", kind: "element", tag: "text", name: "Role", bind: { source: "self", path: "role" }, style: { base: { fontSize: "{size.sm}", color: "{color.primary}", fontWeight: 500 } } },
                                        ]
                                    }
                                ],
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
                ]
            },
        ],
    },
    designSchema: [
        { key: "layout", type: "select", label: "Layout", options: [{ value: "grid-2", label: "2 columns" }, { value: "grid-3", label: "3 columns" }, { value: "grid-4", label: "4 columns" }] },
        { key: "shape", type: "select", label: "Image shape", options: [{ value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }] },
        { key: "align", type: "select", label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
        { key: "useCarousel", type: "boolean", label: "Enable Carousel" },
        { key: "showArrows", type: "boolean", label: "Show Arrows", visibleIf: { key: "useCarousel", equals: true } },
        { key: "showDots", type: "boolean", label: "Show Pagination", visibleIf: { key: "useCarousel", equals: true } },
    ],
    contentSchema: [
        { key: "heading", type: "text", label: "Heading", max: 60 },
        {
            key: "items",
            type: "repeater",
            label: "Team Members",
            itemLabel: "{name}",
            fields: [
                { key: "image", type: "image", label: "Photo" },
                { key: "name", type: "text", label: "Name", max: 50 },
                { key: "role", type: "text", label: "Role/Title", max: 50 },
                { key: "bio", type: "text", label: "Bio", max: 150 },
            ],
        },
    ],
    defaultDesign: { layout: "grid-3", shape: "circle", align: "center", useCarousel: false, showArrows: true, showDots: true },
    defaultContent: {
        heading: "Meet the Team",
        items: [
            {
                name: "Alice Smith",
                role: "Founder & CEO",
                image: "",
                bio: "10+ years scaling tech startups.",
            },
            {
                name: "Bob Jones",
                role: "Head of Design",
                image: "",
                bio: "Obsessed with typography.",
            },
        ],
    },
};
exports.previews = {
    empty: { heading: "", items: [] },
    typical: exports.meta.defaultContent,
    stress: {
        heading: "A".repeat(60),
        items: Array(6).fill({
            name: "A".repeat(50),
            role: "A".repeat(50),
            bio: "A".repeat(150),
        }),
    },
};
