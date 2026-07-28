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
    parts: [
        { key: "root", label: "Container", kind: "container" },
        { key: "cover", label: "Cover photo", kind: "image", parentKey: "root" },
        { key: "avatar", label: "Avatar", kind: "image", parentKey: "root" },
        { key: "logo", label: "Company logo", kind: "image", parentKey: "root" },
        { key: "name", label: "Name", kind: "text", parentKey: "root" },
        {
            key: "subtitle",
            label: "Job title / company",
            kind: "text",
            parentKey: "root",
        },
        { key: "bio", label: "Bio", kind: "text", parentKey: "root" },
        { key: "location", label: "Location", kind: "text", parentKey: "root" },
    ],
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
    defaultPartStyles: {
        root: {
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
        cover: {
            base: {
                width: "100%",
                height: "auto",
                aspectRatio: "450/234",
                objectFit: "cover",
            },
        },
        avatar: {
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
        logo: {
            base: { height: "28px", width: "auto", objectFit: "contain" },
        },
        name: {
            base: {
                fontFamily: "{font.heading}",
                fontSize: "{size.xl}",
                fontWeight: 700,
                color: "{color.text}",
                lineHeight: 1.2,
                padding: { r: "{space.4}", l: "{space.4}" },
            },
        },
        subtitle: {
            base: {
                fontSize: "{size.sm}",
                fontWeight: 500,
                color: "{color.muted}",
                padding: { r: "{space.4}", l: "{space.4}" },
            },
        },
        bio: {
            base: {
                fontSize: "{size.sm}",
                color: "{color.muted}",
                lineHeight: 1.55,
                padding: { t: "{space.1}", r: "{space.5}", b: "0", l: "{space.5}" },
            },
        },
        location: {
            base: {
                fontSize: "{size.xs}",
                color: "{color.muted}",
                padding: { r: "{space.4}", l: "{space.4}" },
            },
        },
    },
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
