"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: "PROFILE",
    label: "Profile",
    iconName: "User",
    group: "system",
    description: "Avatar, cover photo, name, title and bio pulled from General Info.",
    contentVersion: 1,
    derived: true,
    defaultLayout: {
        id: "root",
        kind: "element",
        tag: "stack",
        style: {
            base: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "{space.2}",
                padding: { t: "0", r: "0", b: "{space.5}", l: "0" },
                background: { kind: "color", color: "{color.surface}" },
                borderRadius: { all: "{radius.lg}" },
                overflow: "hidden",
                textAlign: "center",
            },
        },
        children: [
            {
                id: "cover",
                kind: "element",
                tag: "image",
                bind: { source: "card", field: "coverPhoto" },
                hideIfEmpty: true,
                style: {
                    base: {
                        width: "100%",
                        height: "auto",
                        aspectRatio: "450/234",
                        objectFit: "cover",
                    },
                },
            },
            {
                id: "avatar",
                kind: "element",
                tag: "image",
                bind: { source: "card", field: "profileImage" },
                hideIfEmpty: true,
                style: {
                    base: {
                        width: "88px",
                        height: "88px",
                        objectFit: "cover",
                        borderRadius: { all: "{radius.full}" },
                        border: { width: "3px", style: "solid", color: "{color.surface}" },
                        boxShadow: "{shadow.md}",
                        margin: { t: "-56px", b: "{space.1}" },
                    },
                },
            },
            {
                id: "logo",
                kind: "element",
                tag: "image",
                bind: { source: "card", field: "companyLogo" },
                hideIfEmpty: true,
                style: {
                    base: { height: "28px", width: "auto", objectFit: "contain" },
                },
            },
            {
                id: "name",
                kind: "element",
                tag: "heading",
                props: { level: 2 },
                bind: { source: "card", field: "fullName" },
                hideIfEmpty: true,
                style: {
                    base: {
                        fontFamily: "{font.heading}",
                        fontSize: "{size.xl}",
                        fontWeight: 700,
                        color: "{color.text}",
                        lineHeight: 1.2,
                        padding: { r: "{space.4}", l: "{space.4}" },
                    },
                },
            },
            {
                id: "subtitle",
                kind: "element",
                tag: "text",
                bind: { source: "card", field: "jobTitle" },
                hideIfEmpty: true,
                style: {
                    base: {
                        fontSize: "{size.sm}",
                        fontWeight: 500,
                        color: "{color.muted}",
                        padding: { r: "{space.4}", l: "{space.4}" },
                    },
                },
            },
            {
                id: "bio",
                kind: "element",
                tag: "text",
                bind: { source: "card", field: "bio" },
                hideIfEmpty: true,
                style: {
                    base: {
                        fontSize: "{size.sm}",
                        color: "{color.muted}",
                        lineHeight: 1.55,
                        padding: { t: "{space.1}", r: "{space.5}", b: "0", l: "{space.5}" },
                    },
                },
            },
            {
                id: "location",
                kind: "element",
                tag: "text",
                bind: { source: "card", field: "location" },
                hideIfEmpty: true,
                style: {
                    base: {
                        fontSize: "{size.xs}",
                        color: "{color.muted}",
                        padding: { r: "{space.4}", l: "{space.4}" },
                    },
                },
            },
        ],
    },
    designSchema: [
        { key: "showCover", type: "boolean", label: "Show cover photo" },
        { key: "showAvatar", type: "boolean", label: "Show avatar" },
        { key: "showLogo", type: "boolean", label: "Show company logo" },
        { key: "showBio", type: "boolean", label: "Show bio" },
        { key: "showLocation", type: "boolean", label: "Show location" },
        {
            key: "align",
            type: "select",
            label: "Alignment",
            options: [
                { value: "center", label: "Centered" },
                { value: "left", label: "Left" },
            ],
        },
    ],
    contentSchema: [],
    defaultDesign: {
        showCover: true,
        showAvatar: true,
        showLogo: true,
        showBio: true,
        showLocation: true,
        align: "center",
    },
    defaultContent: {},
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
