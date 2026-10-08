/**
 * TemplateDefinition — the complete, self-contained description of a card
 * design. Stored on `CardTemplateVersion.definition` (JSONB).
 *
 * It contains style TOKENS, never CSS text. CSS is a build artifact produced
 * by `compileCss()` on publish and served immutably from R2.
 */

import type { ElementNode, Node } from "./node";
import type { StyleSet, StyleValue } from "./style";

export const SCHEMA_VERSION = 2 as const;

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

export const TOKEN_GROUPS = [
  "color",
  "space",
  "radius",
  "font",
  "size",
  "shadow",
] as const;
export type TokenGroup = (typeof TOKEN_GROUPS)[number];

/** CSS custom-property prefix per token group. */
export const TOKEN_PREFIX: Record<TokenGroup, string> = {
  color: "--c-",
  space: "--sp-",
  radius: "--r-",
  font: "--f-",
  size: "--sz-",
  shadow: "--sh-",
};

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
  type: "text" | "textarea" | "richtext" | "url" | "image" | "video" | "icon";
  /** The child layer's prop this field writes (text, html, src, name, url, label, href). */
  prop?: string;
  /** `false` hides the field from the card editor; the template default renders. */
  editable?: boolean;
  default?: unknown;
  hint?: string;
}

export interface TemplateCustomBlock {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  sourceNodeId?: string;
  /**
   * Set when the backend synced this block from the admin widget library.
   * Such blocks are owned by the library: templates don't edit or re-derive
   * them, and their `sourceNodeId` refers to another template.
   */
  libraryId?: string;
  /** Plan needed to add it in the card editor (library widgets). */
  tier?: "FREE" | "PRO";
  /** Disabled in the library: existing cards render it, nobody can add it. */
  hidden?: boolean;
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

// ─── Hard limits (enforced by the validator, not just the UI) ────────────────

export const DEFINITION_LIMITS = {
  maxNodes: 500,
  maxDepth: 12,
  /** Serialized definition size, bytes. */
  maxBytes: 200_000,
  maxPopups: 4,
  maxFonts: 4,
  maxTokensPerGroup: 64,
  /** Compiled stylesheet ceiling — a warning above this, hard fail at 2×. */
  cssWarnBytes: 60_000,
} as const;

/** A brand-new template: minimal but valid and publishable. */
export function blankDefinition(name: string): TemplateDefinition {
  return {
    schemaVersion: SCHEMA_VERSION,
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
export function definitionRoots(def: TemplateDefinition): Node[] {
  return [def.root, ...(def.popups ?? []).map((p) => p.root)];
}
