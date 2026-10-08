import type { ElementNode, Node, WidgetNode } from '../types/node';
import { isElement, isSlot, isWidget } from '../types/node';

/**
 * Widgets driven by card data (profile, links, vcard…). Every other widget is
 * an optional block: on a user card it only renders through the user's blocks.
 */
export const CORE_WIDGETS = new Set([
  'PROFILE',
  'CONNECT_BUTTONS',
  'HEADER',
  'NAV',
  'CONTACT_LINKS',
  'CONTACT_BUTTONS',
  'LINK_BUTTONS',
  'CUSTOM_LINKS',
  'LINKS',
  'SOCIAL_ICONS',
  'SOCIAL_LINKS',
  'SOCIAL',
  'COPYRIGHT',
  'VCARD_BUTTON',
  'SHARE_BUTTON',
]);

const LINK_WIDGETS = new Set([
  'CONTACT_LINKS',
  'CONTACT_BUTTONS',
  'LINK_BUTTONS',
  'CUSTOM_LINKS',
  'LINKS',
]);

const SOCIAL_WIDGETS = new Set(['SOCIAL_ICONS', 'SOCIAL_LINKS', 'SOCIAL']);

const SOCIAL_PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'x',
  'linkedin',
  'youtube',
  'tiktok',
  'github',
  'whatsapp',
  'telegram',
  'discord',
  'pinterest',
];

export function isCoreWidget(widget: string | undefined): boolean {
  return CORE_WIDGETS.has((widget || '').toUpperCase());
}

/** The slice of the render context the visibility rules read. */
export interface VisibilityCtx {
  links?: any[];
  blocks?: any[];
  blockNodeMap?: Map<string, any>;
  isEditing?: boolean;
  gatedWidgetKeys?: string[];
  placeholderId?: string | null;
  injectBefore?: boolean;
  isRenderingUserBlocks?: boolean;
  showPlaceholders?: boolean;
  customBlockSourceIds?: Set<string>;
}

/**
 * A custom block's source layer group lives in the template tree. On a user
 * card it must not render there — only as the user's block — or it shows up
 * before being added and twice once added.
 */
export function isCustomBlockSourceHidden(id: string, ctx: VisibilityCtx): boolean {
  if (ctx.isEditing || !Array.isArray(ctx.blocks) || ctx.isRenderingUserBlocks) {
    return false;
  }
  return Boolean(ctx.customBlockSourceIds?.has(id));
}

/**
 * True when a template widget renders nothing on a user card: an optional
 * widget that isn't hosting the user's blocks, or a links/social widget with
 * nothing to show. Builder canvas and template previews (no `blocks`) always
 * render every widget.
 */
export function isWidgetHiddenOnCard(node: WidgetNode, ctx: VisibilityCtx): boolean {
  if (ctx.isEditing || !Array.isArray(ctx.blocks)) return false;
  // A gated widget renders its upsell instead.
  if (ctx.gatedWidgetKeys?.includes(node.key) || ctx.gatedWidgetKeys?.includes(node.widget)) {
    return false;
  }

  // If a block has been explicitly mapped to this template widget node, keep it visible!
  if (ctx.blockNodeMap?.has(node.id)) {
    return false;
  }

  const w = (node.widget || '').toUpperCase();
  const blocks = ctx.blocks;

  if (!CORE_WIDGETS.has(w)) {
    if (ctx.isRenderingUserBlocks) return false;
    // The placeholder renders the user's blocks in its place.
    return !(node.id === ctx.placeholderId && !ctx.injectBefore);
  }

  if (LINK_WIDGETS.has(w)) {
    const hasLinks = Array.isArray(ctx.links) && ctx.links.length > 0;
    const hasBlock = blocks.some(
      (b) =>
        b.type === 'LINKS' ||
        b.type === 'LINK_BUTTONS' ||
        b.type === 'CONTACT_LINKS' ||
        b.widget === 'LINKS' ||
        b.widget === 'CONTACT_LINKS',
    );
    return !hasLinks && !hasBlock;
  }

  if (SOCIAL_WIDGETS.has(w)) {
    const hasSocialLinks =
      Array.isArray(ctx.links) &&
      ctx.links.some(
        (l) =>
          l.group === 'social' ||
          SOCIAL_PLATFORMS.some((platform) =>
            (l.type || l.title || l.url || '').toLowerCase().includes(platform),
          ),
      );
    const hasBlock = blocks.some(
      (b) => b.type === 'SOCIAL' || b.type === 'SOCIAL_ICONS' || b.widget === 'SOCIAL',
    );
    return !hasSocialLinks && !hasBlock;
  }

  return false;
}

/** Leaf tags that are content in their own right, not decoration. */
const LIVE_TAGS = new Set(['button', 'link', 'richtext', 'embed', 'video', 'carousel', 'carousel-root']);

type Presence = 'live' | 'removed' | 'static';

/**
 * Ids of template elements that would render as empty chrome on a user card.
 *
 * Hiding an unused widget leaves its wrapping section frame behind — padding,
 * background and radius with nothing inside: a blank box. A container is
 * collapsed when it held at least one hidden widget and nothing else that
 * still carries content (a visible widget, a slot, a bound element, a
 * button/link). Purely decorative leftovers (a static "Section title"
 * heading, an icon, a divider) go with it. The root is never collapsed.
 */
export function collectCollapsedIds(root: Node, ctx: VisibilityCtx): Set<string> | undefined {
  if (ctx.isEditing || !Array.isArray(ctx.blocks)) return undefined;
  const collapsed = new Set<string>();

  const visit = (node: Node): Presence => {
    // Hidden like an unused optional widget, so its section frame collapses too.
    if (isCustomBlockSourceHidden(node.id, ctx)) return 'removed';
    if (isWidget(node)) return isWidgetHiddenOnCard(node, ctx) ? 'removed' : 'live';
    if (isSlot(node)) return 'live';
    if (!isElement(node)) return 'static';

    const el = node as ElementNode;
    let sawRemoved = false;
    let sawLive = Boolean(el.bind || el.repeat || LIVE_TAGS.has(el.tag));
    for (const child of el.children ?? []) {
      const p = visit(child);
      if (p === 'live') sawLive = true;
      else if (p === 'removed') sawRemoved = true;
    }

    if (sawLive) return 'live';
    if (!sawRemoved) return 'static';
    if (el.id !== root.id) collapsed.add(el.id);
    return 'removed';
  };

  visit(root);
  return collapsed.size ? collapsed : undefined;
}
