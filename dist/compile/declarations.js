"use strict";
/**
 * StyleProps → CSS declarations.
 *
 * Driven by an explicit table: a property that isn't in `EMITTERS` produces
 * nothing, no matter what is stored in the JSON. Adding a property to the
 * engine means adding a row here AND to the `StyleProps` interface AND to the
 * validator — three deliberate edits, never an accident.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_STYLE_PROPS = exports.EMITTERS = void 0;
exports.declarationsFor = declarationsFor;
exports.serializeDecls = serializeDecls;
const value_1 = require("./value");
/** `value → [[prop, css]]` for one simple property. */
function simple(prop, kind) {
    return (v) => {
        const out = (0, value_1.cssValue)(v, kind);
        return out ? [[prop, out]] : [];
    };
}
/** Keyword property restricted to an explicit set. */
function enumProp(prop, allowed) {
    const set = new Set(allowed.map(s => s.toLowerCase()));
    return (v) => (typeof v === "string" && set.has(v.toLowerCase()) ? [[prop, v.toLowerCase()]] : []);
}
/** Integer property with bounds. */
function int(prop, min, max) {
    return (v) => Number.isFinite(v)
        ? [[prop, String(Math.round((0, value_1.clamp)(v, min, max)))]]
        : [];
}
const ALIGN = [
    "flex-start",
    "flex-end",
    "center",
    "space-between",
    "space-around",
    "space-evenly",
    "stretch",
    "baseline",
    "start",
    "end",
    "normal",
    "auto",
];
exports.EMITTERS = {
    // ── layout ───────────────────────────────────────────────────────────────
    display: enumProp("display", [
        "flex",
        "grid",
        "block",
        "inline-flex",
        "inline-block",
        "none",
        "contents",
    ]),
    flexDirection: enumProp("flex-direction", [
        "row",
        "column",
        "row-reverse",
        "column-reverse",
    ]),
    flexWrap: enumProp("flex-wrap", ["nowrap", "wrap", "wrap-reverse"]),
    justifyContent: enumProp("justify-content", ALIGN),
    alignItems: enumProp("align-items", ALIGN),
    alignSelf: enumProp("align-self", ALIGN),
    gap: simple("gap", "length"),
    rowGap: simple("row-gap", "length"),
    columnGap: simple("column-gap", "length"),
    flexGrow: int("flex-grow", 0, 100),
    flexShrink: int("flex-shrink", 0, 100),
    flexBasis: simple("flex-basis", "length"),
    gridTemplateColumns: simple("grid-template-columns", "gridTemplate"),
    gridTemplateRows: simple("grid-template-rows", "gridTemplate"),
    gridColumn: simple("grid-column", "gridTemplate"),
    gridRow: simple("grid-row", "gridTemplate"),
    gridAutoFlow: enumProp("grid-auto-flow", [
        "row",
        "column",
        "dense",
        "row dense",
        "column dense",
    ]),
    order: int("order", -50, 50),
    // ── positioning ──────────────────────────────────────────────────────────
    position: enumProp("position", [
        "static",
        "relative",
        "absolute",
        "sticky",
        "fixed",
    ]),
    top: simple("top", "length"),
    right: simple("right", "length"),
    bottom: simple("bottom", "length"),
    left: simple("left", "length"),
    zIndex: int("z-index", -50, 9999),
    overflow: (v) => {
        if (v === "hidden") {
            return [
                ["overflow", "hidden"],
                ["isolation", "isolate"],
            ];
        }
        const fn = enumProp("overflow", [
            "visible",
            "hidden",
            "auto",
            "scroll",
            "clip",
        ]);
        return fn(v);
    },
    overflowX: enumProp("overflow-x", [
        "visible",
        "hidden",
        "auto",
        "scroll",
        "clip",
    ]),
    overflowY: enumProp("overflow-y", [
        "visible",
        "hidden",
        "auto",
        "scroll",
        "clip",
    ]),
    isolation: enumProp("isolation", ["auto", "isolate"]),
    // ── box model ────────────────────────────────────────────────────────────
    width: simple("width", "length"),
    minWidth: simple("min-width", "length"),
    maxWidth: simple("max-width", "length"),
    height: simple("height", "length"),
    minHeight: simple("min-height", "length"),
    maxHeight: simple("max-height", "length"),
    aspectRatio: simple("aspect-ratio", "aspectRatio"),
    padding: (v) => {
        const out = (0, value_1.box4)(v);
        return out ? [["padding", out]] : [];
    },
    margin: (v) => {
        const out = (0, value_1.box4)(v);
        return out ? [["margin", out]] : [];
    },
    // ── typography ───────────────────────────────────────────────────────────
    fontFamily: simple("font-family", "fontFamily"),
    fontSize: simple("font-size", "length"),
    fontWeight: int("font-weight", 100, 900),
    fontStyle: enumProp("font-style", ["normal", "italic"]),
    lineHeight: (v) => {
        // Unitless line-height is the good default; lengths still allowed.
        if (typeof v === "number")
            return [["line-height", String((0, value_1.clamp)(v, 0, 10))]];
        const out = (0, value_1.cssValue)(v, "length");
        return out ? [["line-height", out]] : [];
    },
    letterSpacing: simple("letter-spacing", "length"),
    textAlign: enumProp("text-align", ["left", "center", "right", "justify"]),
    textTransform: enumProp("text-transform", [
        "none",
        "uppercase",
        "lowercase",
        "capitalize",
    ]),
    textDecoration: enumProp("text-decoration", [
        "none",
        "underline",
        "line-through",
    ]),
    whiteSpace: enumProp("white-space", [
        "normal",
        "nowrap",
        "pre-line",
        "pre-wrap",
    ]),
    wordBreak: enumProp("word-break", ["normal", "break-word", "break-all"]),
    lineClamp: (v) => Number.isFinite(v) && v > 0
        ? [
            ["display", "-webkit-box"],
            ["-webkit-line-clamp", String(Math.round((0, value_1.clamp)(v, 1, 20)))],
            ["-webkit-box-orient", "vertical"],
            ["overflow", "hidden"],
        ]
        : [],
    color: (v) => {
        const c = (0, value_1.color)(v);
        return c ? [["color", c]] : [];
    },
    strokeWidth: (v) => {
        const out = (0, value_1.cssValue)(v, "length");
        return out ? [["stroke-width", out]] : [];
    },
    // ── decoration ───────────────────────────────────────────────────────────
    background: (v) => (0, value_1.background)(v),
    border: (v) => (0, value_1.border)(v),
    borderRadius: (v) => {
        const out = (0, value_1.corners4)(v);
        return out ? [["border-radius", out]] : [];
    },
    boxShadow: (v) => {
        const out = (0, value_1.shadow)(v);
        return out ? [["box-shadow", out]] : [];
    },
    opacity: (v) => Number.isFinite(v) ? [["opacity", String((0, value_1.clamp)(v, 0, 1))]] : [],
    backdropBlur: (v) => {
        const out = (0, value_1.len)(v);
        return out ? [["backdrop-filter", `blur(${out})`]] : [];
    },
    filter: (v) => typeof v === "string" && /^[a-z0-9()%.,\s-]+$/i.test(v) && v.length < 120
        ? [["filter", v]]
        : [],
    mixBlendMode: enumProp("mix-blend-mode", [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "soft-light",
        "hard-light",
        "difference",
        "luminosity",
    ]),
    clipPath: (v) => typeof v === "string" &&
        /^(polygon|circle|ellipse|inset)\([\d\s%.,a-z-]+\)$/i.test(v)
        ? [["clip-path", v]]
        : [],
    // ── media ────────────────────────────────────────────────────────────────
    objectFit: enumProp("object-fit", [
        "cover",
        "contain",
        "fill",
        "none",
        "scale-down",
    ]),
    objectPosition: simple("object-position", "position"),
    // ── motion ───────────────────────────────────────────────────────────────
    transition: (v) => {
        const out = (0, value_1.transition)(v);
        return out ? [["transition", out]] : [];
    },
    transform: (v) => {
        const out = (0, value_1.transform)(v);
        return out ? [["transform", out]] : [];
    },
    transformOrigin: simple("transform-origin", "position"),
    // ── interaction ──────────────────────────────────────────────────────────
    cursor: enumProp("cursor", ["auto", "pointer", "default", "not-allowed"]),
    pointerEvents: enumProp("pointer-events", ["auto", "none"]),
    userSelect: enumProp("user-select", ["auto", "none", "text"]),
};
/** Every property the engine can emit. Used by the validator as the whitelist. */
exports.ALLOWED_STYLE_PROPS = Object.keys(exports.EMITTERS);
/**
 * Turn one `StyleProps` object into an ordered declaration list.
 * Emission order follows `EMITTERS` insertion order, so output is stable and
 * the content hash only changes when the design actually changes.
 */
function declarationsFor(props) {
    if (!props || typeof props !== "object")
        return [];
    const out = [];
    for (const key of exports.ALLOWED_STYLE_PROPS) {
        const value = props[key];
        if (value === undefined || value === null || value === "")
            continue;
        const emit = exports.EMITTERS[key];
        if (!emit)
            continue;
        for (const decl of emit(value))
            out.push(decl);
    }
    return out;
}
/** `[["color","red"]]` → `color:red` */
function serializeDecls(decls, pretty = false) {
    if (!decls.length)
        return "";
    return pretty
        ? decls.map(([p, v]) => `  ${p}: ${v};`).join("\n")
        : decls.map(([p, v]) => `${p}:${v}`).join(";");
}
