/**
 * TemplateDefinition — the complete, self-contained description of a card
 * design. Stored on `CardTemplateVersion.definition` (JSONB).
 *
 * It contains style TOKENS, never CSS text. CSS is a build artifact produced
 * by `compileCss()` on publish and served immutably from R2.
 */
import type { ElementNode, Node } from "./node";
import type { StyleSet, StyleValue } from "./style";
export declare const SCHEMA_VERSION: 2;
/**
 * Design tokens. Every group compiles to CSS custom properties on the card
 * wrapper, so a Pro user can override a colour without the design changing.
 *
 *   color.primary  →  --c-primary   →  var(--c-primary)
 *   space.4        →  --sp-4
 *   radius.lg      →  --r-lg
 *   font.heading   →  --f-heading
 *   size.lg        →  --sz-lg
 *   shadow.md      →  --sh-md
 */
export interface TokenSet {
    color: Record<string, string>;
    space: Record<string, string>;
    radius: Record<string, string>;
    font: Record<string, string>;
    size: Record<string, string>;
    shadow: Record<string, string>;
}
export declare const TOKEN_GROUPS: readonly ["color", "space", "radius", "font", "size", "shadow"];
export type TokenGroup = (typeof TOKEN_GROUPS)[number];
/** CSS custom-property prefix per token group. */
export declare const TOKEN_PREFIX: Record<TokenGroup, string>;
export interface FontSpec {
    family: string;
    weights: number[];
    /** `self` = served from R2 (preferred). `google` = Google Fonts stylesheet. */
    source: "self" | "google";
    italic?: boolean;
    /** Only for `source: 'self'` — R2 keys per weight. */
    files?: Record<string, string>;
    display?: "swap" | "optional" | "block";
}
export type PopupTrigger = "onLoad" | "afterDelay" | "onExit" | "manual";
/**
 * A popup is just another node tree with a backdrop — which is how lead
 * capture stops being a hardcoded modal component.
 */
export interface PopupDef {
    key: string;
    label: string;
    trigger: PopupTrigger;
    delaySeconds?: number;
    showOncePerDevice?: boolean;
    backdrop?: StyleSet;
    panel?: StyleSet;
    root: ElementNode;
}
export interface DefinitionSettings {
    /** Token colour keys a Pro user is allowed to override. */
    allowTokenOverride?: string[];
    /** Design keys unlocked to the user on every widget unless overridden. */
    defaultUserOptions?: string[];
    /** Extra `<html>`-level colour scheme hint. */
    colorScheme?: "light" | "dark";
}
export interface CustomBlockField {
    nodeId: string;
    key: string;
    label: string;
    type: "text" | "textarea" | "url" | "image" | "video";
    default?: unknown;
    hint?: string;
}
export interface TemplateCustomBlock {
    id: string;
    label: string;
    icon?: string;
    description?: string;
    sourceNodeId?: string;
    layout: Node;
    fields: CustomBlockField[];
    defaultContent: Record<string, unknown>;
}
export interface TemplateDefinition {
    schemaVersion: typeof SCHEMA_VERSION;
    meta: {
        name: string;
        /** Card frame width in px. 450 matches the current public page. */
        canvasWidth: number;
        /** Page background behind the card frame. */
        background?: StyleValue;
        description?: string;
    };
    tokens: TokenSet;
    fonts?: FontSpec[];
    root: ElementNode;
    popups?: PopupDef[];
    customBlocks?: TemplateCustomBlock[];
    settings?: DefinitionSettings;
}
export declare const DEFINITION_LIMITS: {
    readonly maxNodes: 500;
    readonly maxDepth: 12;
    /** Serialized definition size, bytes. */
    readonly maxBytes: 200000;
    readonly maxPopups: 4;
    readonly maxFonts: 4;
    readonly maxTokensPerGroup: 64;
    /** Compiled stylesheet ceiling — a warning above this, hard fail at 2×. */
    readonly cssWarnBytes: 60000;
};
/** A brand-new template: minimal but valid and publishable. */
export declare function blankDefinition(name: string): TemplateDefinition;
/** Convenience: every node in the definition, including popup trees. */
export declare function definitionRoots(def: TemplateDefinition): Node[];
