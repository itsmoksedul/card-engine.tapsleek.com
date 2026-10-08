"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: "ICON",
    label: "Icon",
    iconName: "Smile",
    group: "utility",
    description: "A single icon, optionally linked.",
    contentVersion: 1,
    contentSchema: [
        { key: "icon", type: "icon", label: "Icon", set: "lucide" },
        { key: "link", type: "url", label: "Link" },
    ],
    defaultDesign: { align: "center" },
    defaultContent: { icon: "Star", link: "" },
    defaultLayout: {
        id: "icon-root",
        kind: "element",
        tag: "icon",
        bind: { source: "self", path: "icon" },
        style: {
            base: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "{size.2xl}",
                color: "{color.primary}",
            },
        },
    },
};
exports.previews = {
    empty: { icon: "" },
    typical: exports.meta.defaultContent,
    stress: { icon: "Star", link: "https://example.com/" + "x".repeat(180) },
};
