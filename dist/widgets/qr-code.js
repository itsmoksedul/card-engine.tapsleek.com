"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: "QR_CODE",
    label: "QR Code",
    iconName: "QrCode",
    group: "system",
    description: "The QR code for this digital business card.",
    contentVersion: 1,
    deprecated: { since: "1.0", note: "QR Code widget is deprecated." },
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
                padding: { all: "{space.4}" },
                background: { kind: "color", color: "{color.surface}" },
                borderRadius: { all: "{radius.xl}" },
                boxShadow: "{shadow.md}",
                textAlign: "center",
            },
        },
        children: [
            {
                id: "image",
                kind: "element",
                tag: "image",
                bind: { source: "card", field: "qrUrl" },
                style: {
                    base: {
                        width: "200px",
                        height: "200px",
                        objectFit: "contain",
                    },
                },
            },
        ],
    },
    designSchema: [],
    contentSchema: [],
    defaultDesign: {},
    defaultContent: {},
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
