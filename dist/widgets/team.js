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
        ],
    },
    designSchema: [
        {
            key: "layout",
            type: "select",
            label: "Layout",
            options: [
                { value: "grid-2", label: "2 Columns" },
                { value: "grid-3", label: "3 Columns" },
                { value: "stack", label: "Vertical Stack" },
            ],
        },
        {
            key: "align",
            type: "select",
            label: "Text Alignment",
            options: [
                { value: "center", label: "Center" },
                { value: "left", label: "Left" },
            ],
        },
        {
            key: "avatarShape",
            type: "select",
            label: "Avatar Shape",
            options: [
                { value: "circle", label: "Circle" },
                { value: "square", label: "Square (Rounded)" },
            ],
        },
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
    defaultDesign: { layout: "grid-2", align: "center", avatarShape: "circle" },
    defaultContent: {
        heading: "Meet the Team",
        items: [
            {
                name: "Alice Smith",
                role: "Founder & CEO",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                bio: "10+ years scaling tech startups.",
            },
            {
                name: "Bob Jones",
                role: "Head of Design",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
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
