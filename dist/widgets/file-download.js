"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = exports.FILE_TYPES = void 0;
exports.FILE_TYPES = [
    "PDF",
    "DOC",
    "DOCX",
    "XLS",
    "XLSX",
    "PPT",
    "PPTX",
    "CSV",
    "TXT",
    "ZIP",
    "JPG",
    "PNG",
    "MP4",
    "Other",
];
exports.meta = {
    type: "FILE_DOWNLOAD",
    label: "File Download",
    iconName: "FileDown",
    group: "content",
    description: "A file to download — company profile, brochure, catalogue…",
    contentVersion: 1,
    contentSchema: [
        { key: "title", type: "text", label: "Title", max: 80 },
        { key: "icon", type: "icon", label: "Icon", set: "lucide" },
        {
            key: "file",
            type: "url",
            label: "File",
            hint: "Paste a link, or choose a file from your media library.",
        },
        {
            key: "fileType",
            type: "select",
            label: "File type",
            options: exports.FILE_TYPES.map((t) => ({ value: t, label: t })),
        },
        {
            key: "fileSize",
            type: "text",
            label: "File size",
            max: 20,
            hint: "e.g. 2.5 MB — filled in for files from your media library.",
        },
    ],
    defaultDesign: {},
    defaultContent: {
        title: "Company Profile",
        icon: "Download",
        file: "",
        fileType: "PDF",
        fileSize: "2.5 MB",
    },
    defaultLayout: {
        id: "file-root",
        kind: "element",
        tag: "frame",
        name: "File card",
        style: {
            base: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "{space.4}",
                padding: { all: "{space.4}" },
                background: { kind: "color", color: "{color.surface}" },
                border: { width: "1px", style: "solid", color: "{color.border}" },
                borderRadius: { all: "{radius.lg}" },
            },
        },
        children: [
            {
                id: "fileInfo",
                kind: "element",
                tag: "stack",
                name: "Info",
                style: {
                    base: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "{space.1}",
                        minWidth: 0,
                    },
                },
                children: [
                    {
                        id: "fileTitle",
                        kind: "element",
                        tag: "heading",
                        name: "Title",
                        props: { level: 3 },
                        bind: { source: "self", path: "title" },
                        hideIfEmpty: true,
                        style: {
                            base: {
                                fontSize: "{size.lg}",
                                fontWeight: 500,
                                color: "{color.text}",
                                lineHeight: 1.2,
                            },
                        },
                    },
                    {
                        id: "fileMeta",
                        kind: "element",
                        tag: "stack",
                        name: "File details",
                        style: {
                            base: {
                                display: "flex",
                                flexDirection: "row",
                                gap: "{space.4}",
                                fontSize: "{size.sm}",
                                color: "{color.muted}",
                            },
                        },
                        children: [
                            {
                                id: "fileType",
                                kind: "element",
                                tag: "text",
                                name: "File type",
                                bind: { source: "self", path: "fileType" },
                                hideIfEmpty: true,
                            },
                            {
                                id: "fileSize",
                                kind: "element",
                                tag: "text",
                                name: "File size",
                                bind: { source: "self", path: "fileSize" },
                                hideIfEmpty: true,
                            },
                        ],
                    },
                ],
            },
            {
                id: "fileButton",
                kind: "element",
                tag: "link",
                name: "Download button",
                bind: { source: "self", path: "file" },
                props: { action: "link", target: "_blank" },
                style: {
                    base: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        width: "64px",
                        height: "56px",
                        borderRadius: { all: "{radius.lg}" },
                        background: { kind: "color", color: "{color.text}" },
                        color: "{color.bg}",
                    },
                },
                children: [
                    {
                        id: "fileIcon",
                        kind: "element",
                        tag: "icon",
                        name: "Icon",
                        bind: { source: "self", path: "icon" },
                        style: {
                            base: { fontSize: "24px", width: "24px", height: "24px" },
                        },
                    },
                ],
            },
        ],
    },
};
exports.previews = {
    empty: { title: "", icon: "", file: "", fileType: "", fileSize: "" },
    typical: exports.meta.defaultContent,
    stress: {
        title: "A".repeat(80),
        icon: "Download",
        file: "https://example.com/" + "x".repeat(180) + ".pdf",
        fileType: "PDF",
        fileSize: "999.9 MB",
    },
};
