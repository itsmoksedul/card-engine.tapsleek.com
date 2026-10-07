import { definitionRoots, type TemplateDefinition } from '../types/definition';
import { isWidget, walkTreeOrder, type ElementNode } from '../types/node';
import type { StyleSet } from '../types/style';
import { getWidgetMeta } from '../widgets/registry';

export interface BlockDesign {
  design: Record<string, unknown>;
  partStyles: Record<string, StyleSet>;
  layout?: ElementNode;
  rootStyle?: StyleSet;
  rootHidden?: Partial<Record<'base' | 'sm' | 'md', boolean>>;
}

type Instance = { design?: Record<string, unknown>; partStyles?: Record<string, StyleSet>; layout?: ElementNode; rootStyle?: StyleSet; rootHidden?: Partial<Record<'base' | 'sm' | 'md', boolean>>; };

/** First widget instance of `type` found in the template tree, if any. */
function templateInstance(def: TemplateDefinition, type: string): Instance | null {
  for (const root of definitionRoots(def)) {
    const matches: Instance[] = [];
    walkTreeOrder(root, (n) => {
      if (isWidget(n) && n.widget === type) {
        matches.push({ design: n.design, partStyles: n.partStyles, layout: n.layout, rootStyle: n.style, rootHidden: n.hidden });
      }
    });
    if (matches.length) return matches[0];
  }
  return null;
}

/**
 * The `(design, partStyles)` a user block of `type` should render with, given
 * the card's template. Deterministic and pure.
 */
export function resolveBlockDesign(def: TemplateDefinition, type: string): BlockDesign {
  const normType = (type || '').toUpperCase();
  const aliasMap: Record<string, string> = {
    MAPS: 'MAP',
    HOURS: 'BUSINESS_HOURS',
    REVIEWS: 'TESTIMONIALS',
    BUTTON: 'CTA_BUTTON',
    SOCIAL_ICON: 'SOCIAL_ICONS',
    HR: 'DIVIDER',
    SPACE: 'SPACER',
    HTML_EMBED: 'EMBED',
    VCARD: 'VCARD_BUTTON',
    LINKS: 'CONTACT_LINKS',
  };
  const targetType = aliasMap[normType] || normType;

  const inst = templateInstance(def, targetType) ?? templateInstance(def, type);
  const meta = getWidgetMeta(targetType) ?? getWidgetMeta(type);

  // Deep-merge partStyles so parts omitted in template instances retain their widget defaults
  const partStyles: Record<string, StyleSet> = { ...(meta?.defaultPartStyles ?? {}) };
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

  return {
    design: { ...(meta?.defaultDesign ?? {}), ...(inst?.design ?? {}) },
    partStyles,
    layout: inst?.layout ?? meta?.defaultLayout,
    rootStyle: inst?.rootStyle,
    rootHidden: inst?.rootHidden,
  };
}

/**
 * Every widget type a user may add as a block. Design/decoration + content
 * widgets are user-addable; identity widgets that read card data (`derived`)
 * and the lead form (edited in its own tab) are not.
 */
export function userBlockTypes(allTypes: { type: string; derived?: boolean }[]): string[] {
  const EXCLUDED = new Set(['LEAD_FORM']);
  return allTypes.filter((m) => !m.derived && !EXCLUDED.has(m.type)).map((m) => m.type);
}

/** The CSS class a block wrapper carries so it picks up the template preset. */
export function blockClass(type: string): string {
  return `tsb-${String(type).replace(/[^A-Za-z0-9_-]/g, '')}`;
}
