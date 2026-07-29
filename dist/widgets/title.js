"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: "TITLE",
    label: "Title",
    iconName: "Heading",
    group: "content",
    description: "A standalone heading.",
    contentVersion: 1,
    contentSchema: [
        { key: "text", type: "text", label: "Text", required: true, max: 120 },
    ],
    defaultDesign: { level: "h2", align: "left" },
    defaultContent: { text: "Section title" },
    defaultLayout: {
        id: "root",
        kind: "element",
        tag: "frame",
        style: {
            base: { display: "flex", flexDirection: "column" },
        },
        children: [
            {
                id: "text",
                kind: "element",
                tag: "heading",
                bind: { source: "self", path: "text" },
                props: { level: 2 },
                style: {
                    base: {
                        fontFamily: "{font.heading}",
                        fontSize: "{size.xl}",
                        fontWeight: 700,
                        color: "{color.text}",
                    },
                },
            },
        ],
    },
};
exports.previews = {
    empty: { text: "" },
    typical: exports.meta.defaultContent,
    stress: { text: "A".repeat(120) },
};
