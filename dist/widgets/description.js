"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: "DESCRIPTION",
    label: "Description",
    iconName: "AlignLeft",
    group: "content",
    description: "A paragraph of plain text.",
    contentVersion: 1,
    contentSchema: [{ key: "text", type: "textarea", label: "Text", max: 600 }],
    defaultDesign: { align: "left" },
    defaultContent: { text: "Tell people a little about what you do." },
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
                tag: "text",
                bind: { source: "self", path: "text" },
                style: {
                    base: {
                        fontSize: "{size.base}",
                        lineHeight: 1.6,
                        color: "{color.muted}",
                    },
                },
            },
        ],
    },
};
exports.previews = {
    empty: { text: "" },
    typical: exports.meta.defaultContent,
    stress: { text: "Lorem ipsum dolor sit amet. ".repeat(30) },
};
