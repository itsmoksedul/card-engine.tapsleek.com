import { isCoreWidget } from "../render/card-visibility";
import { definitionRoots, type TemplateDefinition } from "../types/definition";
import { isWidget, walkTreeOrder, type ElementNode } from "../types/node";
import type { StyleSet } from "../types/style";
import { getWidgetMeta, normalizeWidgetType } from "../widgets/registry";

export interface BlockDesign {
  design: Record<string, unknown>;
  partStyles: Record<string, StyleSet>;
  layout?: ElementNode;
  hasCustomLayout?: boolean;
  rootStyle?: StyleSet;
  rootHidden?: Partial<Record<"base" | "sm" | "md", boolean>>;
}

type Instance = {
  design?: Record<string, unknown>;
  partStyles?: Record<string, StyleSet>;
  layout?: ElementNode;
  rootStyle?: StyleSet;
  rootHidden?: Partial<Record<"base" | "sm" | "md", boolean>>;
};

/** First widget instance of `type` found in the template tree, if any. */
function templateInstance(
  def: TemplateDefinition,
  type: string,
): Instance | null {
  const normTarget = normalizeWidgetType(type).toUpperCase();
  const lowerType = type.toLowerCase();
  for (const root of definitionRoots(def)) {
    let matched: Instance | null = null;
    walkTreeOrder(root, (n) => {
      if (matched) return;
      if (isWidget(n)) {
        const wNorm = normalizeWidgetType(n.widget).toUpperCase();
        const keyLower = (n.key || "").toLowerCase();
        const labelLower = (n.label || "").toLowerCase();
        if (
          wNorm === normTarget ||
          n.widget === type ||
          n.widget?.toUpperCase() === normTarget ||
          keyLower === lowerType ||
          labelLower === lowerType
        ) {
          matched = {
            design: n.design,
            partStyles: n.partStyles,
            layout: n.layout,
            rootStyle: n.style,
            rootHidden: n.hidden,
          };
        }
      }
    });
    if (matched) return matched;
  }
  return null;
}

/**
 * Find the first non-core widget in the template tree. This is the generic
 * "placeholder" for user blocks, so its custom outer styles (margin, border, background)
 * should apply as a generic template to any block type the user adds.
 */
function templatePlaceholder(
  def: TemplateDefinition,
): Pick<Instance, "rootStyle" | "rootHidden"> | null {
  for (const root of definitionRoots(def)) {
    let matched: Pick<Instance, "rootStyle" | "rootHidden"> | null = null;
    walkTreeOrder(root, (n) => {
      if (matched) return;
      if (isWidget(n)) {
        if (!isCoreWidget(n.widget)) {
          matched = {
            rootStyle: n.style,
            rootHidden: n.hidden,
          };
        }
      }
    });
    if (matched) return matched;
  }
  return null;
}

/**
 * The `(design, partStyles)` a user block of `type` should render with, given
 * the card's template. Deterministic and pure.
 */
export function resolveBlockDesign(
  def: TemplateDefinition,
  type: string,
): BlockDesign {
  const normType = (type || "").toUpperCase();
  const aliasMap: Record<string, string> = {
    MAPS: "MAP",
    LOCATION: "MAP",
    MAP: "MAP",
    ABOUT_US: "DESCRIPTION",
    ABOUT: "DESCRIPTION",
    HOURS: "BUSINESS_HOURS",
    REVIEWS: "TESTIMONIALS",
    BUTTON: "CTA_BUTTON",
    SOCIAL_ICON: "SOCIAL_ICONS",
    HR: "DIVIDER",
    SPACE: "SPACER",
    HTML_EMBED: "EMBED",
    VCARD: "VCARD_BUTTON",
    LINKS: "CONTACT_LINKS",
  };
  const targetType = aliasMap[normType] || normType;

  let inst = templateInstance(def, targetType) ?? templateInstance(def, type);
  if (!inst) {
    const placeholder = templatePlaceholder(def);
    if (placeholder) {
      // Fallback to the placeholder's explicitly authored root styles, so generic
      // spacing/borders apply to all user blocks even if they don't match the placeholder's type.
      inst = {
        rootStyle: placeholder.rootStyle,
        rootHidden: placeholder.rootHidden,
      };
    }
  }

  const meta = getWidgetMeta(targetType) ?? getWidgetMeta(type);

  // Part styles: start with meta defaults, but NEVER inject automatic padding/margin onto root
  const partStyles: Record<string, StyleSet> = {};
  if (meta?.defaultPartStyles) {
    for (const [part, set] of Object.entries(meta.defaultPartStyles)) {
      const cloned = structuredClone(set);
      // Strip automatic root padding/margin so admin design rules supreme
      if (part === "root" && cloned.base) {
        delete (cloned.base as any).padding;
        delete (cloned.base as any).margin;
      }
      partStyles[part] = cloned;
    }
  }

  // If a template instance exists from Admin, its authored partStyles take priority
  if (inst?.partStyles) {
    for (const [part, set] of Object.entries(inst.partStyles)) {
      partStyles[part] = {
        ...(partStyles[part] ?? {}),
        ...(set ?? {}),
        base: { ...(partStyles[part]?.base ?? {}), ...(set?.base ?? {}) },
        sm: { ...(partStyles[part]?.sm ?? {}), ...(set?.sm ?? {}) },
        md: { ...(partStyles[part]?.md ?? {}), ...(set?.md ?? {}) },
      };
    }
  }

  // Layout: If the admin authored a custom layout in the template, USE IT DIRECTLY!
  // Do NOT merge defaultLayout over it, which re-injects unwanted default padding/margin/structure.
  const rawLayout = inst?.layout
    ? structuredClone(inst.layout)
    : meta?.defaultLayout
      ? structuredClone(meta.defaultLayout)
      : undefined;

  let layout = rawLayout;
  if (layout) {
    const rootStyle = inst?.rootStyle;
    const rootPartStyle = inst?.partStyles?.root;
    if (rootStyle || rootPartStyle) {
      layout.style = {
        ...(layout.style ?? {}),
        base: {
          ...(layout.style?.base ?? {}),
          ...(rootPartStyle?.base ?? {}),
          ...(rootStyle?.base ?? {}),
        },
        sm: {
          ...(layout.style?.sm ?? {}),
          ...(rootPartStyle?.sm ?? {}),
          ...(rootStyle?.sm ?? {}),
        },
        md: {
          ...(layout.style?.md ?? {}),
          ...(rootPartStyle?.md ?? {}),
          ...(rootStyle?.md ?? {}),
        },
      };
    }
  }

  return {
    design: { ...(meta?.defaultDesign ?? {}), ...(inst?.design ?? {}) },
    partStyles,
    layout,
    hasCustomLayout: Boolean(inst?.layout),
    rootStyle: inst?.rootStyle,
    rootHidden: inst?.rootHidden,
  };
}

/**
 * Every widget type a user may add as a block. Design/decoration + content
 * widgets are user-addable; identity widgets that read card data (`derived`)
 * and the lead form (edited in its own tab) are not.
 */
export function userBlockTypes(
  allTypes: { type: string; derived?: boolean }[],
): string[] {
  const EXCLUDED = new Set(["LEAD_FORM"]);
  return allTypes
    .filter((m) => !m.derived && !EXCLUDED.has(m.type))
    .map((m) => m.type);
}

/** The CSS class a block wrapper carries so it picks up the template preset. */
export function blockClass(type: string): string {
  return `tsb-${String(type).replace(/[^A-Za-z0-9_-]/g, "")}`;
}
