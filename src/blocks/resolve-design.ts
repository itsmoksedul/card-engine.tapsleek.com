/**
 * resolveBlockDesign — how a user block gets its look (v2.1).
 *
 * A user block stores only content. Its design comes from the card's TEMPLATE:
 *
 *   1. If the template contains a widget of the same type, use that instance's
 *      `design` + `partStyles` — "the template's design pattern for this widget."
 *   2. Otherwise fall back to the widget meta's `defaultDesign` +
 *      `defaultPartStyles`, so a block of a type the template never used still
 *      renders styled rather than raw.
 *
 * Framework-free: shared by the compiler (emits the preset CSS) and the renderer
 * (applies the preset design), so the two can never disagree.
 */

import { definitionRoots, type TemplateDefinition } from '../types/definition';
import { isWidget, walkTreeOrder, type ElementNode } from '../types/node';
import type { StyleSet } from '../types/style';
import { getWidgetMeta } from '../widgets/registry';

export interface BlockDesign {
  design: Record<string, unknown>;
  partStyles: Record<string, StyleSet>;
  layout?: ElementNode;
}

type Instance = { design?: Record<string, unknown>; partStyles?: Record<string, StyleSet>; layout?: ElementNode };

/** First widget instance of `type` found in the template tree, if any. */
function templateInstance(def: TemplateDefinition, type: string): Instance | null {
  for (const root of definitionRoots(def)) {
    const matches: Instance[] = [];
    walkTreeOrder(root, (n) => {
      if (isWidget(n) && n.widget === type) {
        matches.push({ design: n.design, partStyles: n.partStyles, layout: n.layout });
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
  const inst = templateInstance(def, type);
  const meta = getWidgetMeta(type);
  return {
    design: { ...(meta?.defaultDesign ?? {}), ...(inst?.design ?? {}) },
    partStyles: inst?.partStyles ?? meta?.defaultPartStyles ?? {},
    layout: inst?.layout ?? meta?.defaultLayout,
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
