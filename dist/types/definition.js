"use strict";
/**
 * TemplateDefinition — the complete, self-contained description of a card
 * design. Stored on `CardTemplateVersion.definition` (JSONB).
 *
 * It contains style TOKENS, never CSS text. CSS is a build artifact produced
 * by `compileCss()` on publish and served immutably from R2.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFINITION_LIMITS = exports.TOKEN_PREFIX = exports.TOKEN_GROUPS = exports.SCHEMA_VERSION = void 0;
exports.blankDefinition = blankDefinition;
exports.definitionRoots = definitionRoots;
exports.editableThemeColors = editableThemeColors;
exports.SCHEMA_VERSION = 2;
exports.TOKEN_GROUPS = [
    "color",
    "space",
    "radius",
    "font",
    "size",
    "shadow",
];
/** CSS custom-property prefix per token group. */
exports.TOKEN_PREFIX = {
    color: "--c-",
    space: "--sp-",
    radius: "--r-",
    font: "--f-",
    size: "--sz-",
    shadow: "--sh-",
};
// ─── Hard limits (enforced by the validator, not just the UI) ────────────────
exports.DEFINITION_LIMITS = {
    maxNodes: 500,
    maxDepth: 12,
    /** Serialized definition size, bytes. */
    maxBytes: 200_000,
    maxPopups: 4,
    maxFonts: 16,
    maxTokensPerGroup: 64,
    /** Compiled stylesheet ceiling — a warning above this, hard fail at 2×. */
    cssWarnBytes: 60_000,
};
/** A brand-new template: minimal but valid and publishable. */
function blankDefinition(name) {
    return {
        schemaVersion: exports.SCHEMA_VERSION,
        meta: { name, canvasWidth: 450, background: "{color.bg}" },
        tokens: {
            color: {
                primary: "#3B5BFE",
                onPrimary: "#FFFFFF",
                bg: "#F4F7FF",
                surface: "#FFFFFF",
                text: "#111827",
                muted: "#6B7280",
                border: "#E5E7EB",
            },
            space: {
                "1": "4px",
                "2": "8px",
                "3": "12px",
                "4": "16px",
                "5": "20px",
                "6": "24px",
                "8": "32px",
            },
            radius: {
                none: "0px",
                sm: "8px",
                md: "12px",
                lg: "16px",
                full: "9999px",
            },
            font: { heading: "Inter", body: "Inter" },
            size: {
                xs: "11px",
                sm: "13px",
                base: "15px",
                lg: "18px",
                xl: "22px",
                "2xl": "28px",
            },
            shadow: {
                sm: "0 1px 2px rgba(0,0,0,.06)",
                md: "0 4px 12px rgba(0,0,0,.08)",
            },
        },
        fonts: [
            {
                family: "Inter",
                weights: [400, 500, 600, 700],
                source: "self",
                display: "swap",
            },
        ],
        root: {
            kind: "element",
            id: "root",
            tag: "frame",
            name: "Root",
            style: {
                base: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "{space.4}",
                    padding: { all: "{space.4}" },
                    background: { kind: "color", color: "{color.bg}" },
                },
            },
            children: [],
        },
        settings: { allowTokenOverride: ["primary", "bg", "text"] },
    };
}
/** Convenience: every node in the definition, including popup trees. */
function definitionRoots(def) {
    return [def.root, ...(def.popups ?? []).map((p) => p.root)];
}
const LEGACY_THEME_COLORS = ["bg", "primary", "text", "border"];
const LEGACY_LABELS = {
    bg: "Background Color",
    primary: "Primary Color",
    text: "Text Color",
    border: "Border Color",
};
function humanizeToken(name) {
    const words = name
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[-_]+/g, " ")
        .trim();
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : name;
}
/**
 * The colours a card owner may change for this template, in the order the
 * template designer listed them, with the designer's labels. Shared by the
 * web and mobile card editors so both show the same list.
 *
 * Templates that never chose any fall back to the classic four.
 */
function editableThemeColors(def) {
    const d = (def ?? {});
    const table = (d.tokens?.color ?? {});
    const labels = (d.settings?.tokenLabels ?? {});
    const chosen = Array.isArray(d.settings?.allowTokenOverride)
        ? d.settings.allowTokenOverride.filter((n) => typeof table[n] === "string")
        : [];
    const names = chosen.length ? chosen : LEGACY_THEME_COLORS;
    return names.map((name) => ({
        name,
        label: (typeof labels[name] === "string" && labels[name].trim()) ||
            LEGACY_LABELS[name] ||
            humanizeToken(name),
        defaultValue: table[name] ?? "",
    }));
}
