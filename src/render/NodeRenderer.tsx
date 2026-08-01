"use client";
import DOMPurify from "isomorphic-dompurify";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { ElementNode, Node, SlotNode, WidgetNode } from "../types/node";
import { getWidgetMeta } from "../widgets";
import { resolveBinding } from "./resolveBinding";
import { WIDGET_RENDERERS } from "./widgets";
import { RenderIcon } from "./widgets/icon-helper";

export interface RenderCtx {
  card: any;
  links: any[];
  blocks?: any[];
  isEditing?: boolean;
  gatedWidgetKeys?: string[];
  track: (event: any) => void;
  selfData?: any;
  repeatIndex?: number;
  onActionClick?: (action: string) => void;
  renderUserBlocks?: () => React.ReactNode;
  rootId?: string;
  placeholderId?: string | null;
  injectBefore?: boolean;
  isRenderingUserBlocks?: boolean;
}

export interface NodeRendererProps {
  node: Node;
  content: any;
  ctx: RenderCtx;
}

export function NodeRenderer({ node, content, ctx }: NodeRendererProps) {
  if (node.kind === "element")
    return <ElementRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === "widget")
    return <WidgetRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === "slot")
    return <SlotRenderer node={node} content={content} ctx={ctx} />;
  return null;
}

export const CarouselContext = React.createContext<{ emblaApi?: any; emblaRef?: any } | null>(null);

function EmblaCarouselWrapper({ node, content, ctx, dom }: any) {
  const align = content?.carouselAlign ?? "start";
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align });
  const kids = (node.children ?? []).map((child: any) => (
    <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
  ));
  return (
    <CarouselContext.Provider value={{ emblaApi, emblaRef }}>
      <div {...dom}>
        {kids}
      </div>
    </CarouselContext.Provider>
  );
}

// ─── Elements ────────────────────────────────────────────────────────────────

const TAG_MAP: Record<string, string> = {
  frame: "div",
  stack: "div",
  grid: "div",
  text: "p",
  richtext: "div",
  image: "img",
  icon: "span",
  button: "button",
  link: "a",
  divider: "hr",
  spacer: "div",
  embed: "div",
  video: "div",
  carousel: "div",
  "carousel-root": "div",
};

/** HTML void elements — must never be given children or React 19 hard-errors. */
const VOID_DOM_TAGS = new Set(["img", "hr", "br", "input", "wbr"]);

/**
 * Props that configure the ENGINE, not the DOM.
 *
 * These must never reach an HTML element: React forwards unknown attributes
 * verbatim, so spreading `node.props` produced `<p text="…">` and
 * `<img fit="cover">` — invalid HTML plus a console warning per node.
 */
const ENGINE_PROPS = new Set([
  "text",
  "html",
  "level",
  "as",
  "fit",
  "ratio",
  "action",
  "popup",
  "label",
  "name",
  "size",
  "icon",
  "loading",
  "url",
  "controls",
  "autoplay",
  "loop",
]);

function ElementRenderer({
  node,
  content,
  ctx,
}: {
  node: ElementNode;
  content: any;
  ctx: RenderCtx;
}) {
  const ctxEmbla = React.useContext(CarouselContext);
  if (node.visibleIf) {
    const { key, equals } = node.visibleIf;
    const val = content?.[key] ?? ctx.selfData?.[key];
    const isVisible = val === equals || (equals === false && !val);
    if (!isVisible) return null;
  }

  if (node.repeat) {
    const items = resolveBinding(node.repeat, ctx.card, content, ctx.selfData);
    if (!Array.isArray(items)) return null;

    return (
      <React.Fragment>
        {items.map((item, index) => (
          <ElementRenderer
            key={item.id ?? index}
            node={{ ...node, repeat: undefined }}
            content={content}
            ctx={{ ...ctx, selfData: item, repeatIndex: index }}
          />
        ))}
      </React.Fragment>
    );
  }

  const bound = resolveBinding(node.bind, ctx.card, content, ctx.selfData);
  const props = (node.props ?? {}) as Record<string, any>;

  // A bound node that resolves empty disappears entirely — that's what stops an
  // absent bio leaving a gap in the layout.
  if (node.hideIfEmpty && isEmpty(bound)) return null;

  const tag =
    node.tag === "frame"
      ? (props.as as string) || "div"
      : node.tag === "heading"
        ? `h${clampLevel(props.level)}`
        : TAG_MAP[node.tag] || "div";

  const dom: Record<string, any> = { className: `n${node.id} p-${node.id}` };

  // Only forward attributes the DOM actually understands.
  for (const [key, value] of Object.entries(props)) {
    if (ENGINE_PROPS.has(key)) continue;
    dom[key] = value;
  }

  if (ctx.isEditing) dom["data-node-id"] = node.id;
  if (node.a11y?.role) dom.role = node.a11y.role;
  if (node.a11y?.label) dom["aria-label"] = node.a11y.label;

  let children: React.ReactNode = null;

  switch (node.tag) {
    case "carousel-root": {
      return <EmblaCarouselWrapper node={node} content={content} ctx={ctx} dom={dom} />;
    }
    case "carousel": {
      const perView = content?.carouselSlidesPerView ?? 1.25;
      const widthPct = 100 / perView;
      const trackId = `track-${node.id}`;

      const kids = (node.children ?? []).map((child) => (
        <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
      ));
      children = (
        <div ref={ctxEmbla?.emblaRef} style={{ overflow: "hidden", width: "100%" }} className={trackId}>
          <style>{`.${trackId} > div > * { min-width: ${widthPct}% !important; }`}</style>
          <div {...dom} style={{ ...dom.style, overflow: "visible", flexWrap: "nowrap" }}>
            {kids}
          </div>
        </div>
      );
      break;
    }
    case "image": {
      const src = bound ?? props.src ?? "";
      if (!src) {
        if (ctx.isEditing) {
          dom["data-empty"] = "true";
          return React.createElement("span", dom);
        }
        return null;
      }
      dom.src = src;
      dom.alt = props.alt ?? "";
      dom.loading = props.loading ?? "lazy";
      break;
    }
    case "icon": {
      // The glyph name can come from a binding (composite widget content) or a
      // static prop. Bound wins so an icon leaf renders the user's chosen icon.
      const iconName = bound ?? props.name ?? "";
      dom["data-icon"] =
        typeof iconName === "string" ? iconName : (iconName as any)?.name ?? "";
      dom["aria-hidden"] = true;
      if (props.strokeWidth) {
        dom.style = { ...dom.style, strokeWidth: props.strokeWidth };
      }
      // Render the actual lucide/custom glyph. Colour, size (1em) and
      // stroke-width all inherit from this node's compiled `.n<id>` styles.
      if (iconName) children = <RenderIcon name={iconName as any} />;
      break;
    }
    case "heading":
    case "text": {
      children = bound ?? props.text ?? "";
      break;
    }
    case "richtext": {
      const rawHtml = bound ?? props.html ?? "";
      dom.dangerouslySetInnerHTML = {
        __html: DOMPurify.sanitize(String(rawHtml)),
      };
      break;
    }
    case "embed": {
      const rawHtml = bound ?? props.html ?? "";
      dom.dangerouslySetInnerHTML = {
        __html: DOMPurify.sanitize(String(rawHtml), {
          ADD_TAGS: ["iframe"],
          ADD_ATTR: [
            "allow",
            "allowfullscreen",
            "frameborder",
            "scrolling",
            "src",
            "width",
            "height",
          ],
        }),
      };
      break;
    }
    case "video": {
      const url = bound ?? props.url ?? "";
      if (!url) break;
      // Very basic YouTube detection for embed mapping
      if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
        const vid = url.includes("v=")
          ? new URL(url).searchParams.get("v")
          : url.split("/").pop();
        const src = `https://www.youtube.com/embed/${vid}`;
        children = (
          <iframe
            src={src}
            style={{ width: "100%", height: "100%", border: 0 }}
            allowFullScreen
          />
        );
      } else if (url.includes("vimeo.com/")) {
        const vid = url.split("/").pop();
        const src = `https://player.vimeo.com/video/${vid}`;
        children = (
          <iframe
            src={src}
            style={{ width: "100%", height: "100%", border: 0 }}
            allowFullScreen
          />
        );
      } else {
        children = (
          <video
            src={url}
            controls={props.controls}
            autoPlay={props.autoplay}
            loop={props.loop}
            style={{ width: "100%", height: "100%" }}
          />
        );
      }
      break;
    }
    case "button":
    case "link": {
      const action = (props.action as string) || "link";
      dom["data-action"] = action;

      const interceptClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!ctx.isEditing) {
          e.stopPropagation();
        }

        if (action === "carousel-prev") {
          ctxEmbla?.emblaApi?.scrollPrev();
          return;
        }

        if (action === "carousel-next") {
          ctxEmbla?.emblaApi?.scrollNext();
          return;
        }

        if (action === "carousel-dot") {
          ctxEmbla?.emblaApi?.scrollTo(ctx.repeatIndex ?? 0);
          return;
        }

        if (ctx.onActionClick) ctx.onActionClick(action);
      };

      if (action === "link" && node.id !== "connectNow" && node.id !== "saveContact") {
        const href = bound ?? props.href;
        if (node.tag === "link") {
          if (ctx.isEditing || ctx.onActionClick) {
            dom.onClick = interceptClick;
          } else {
            dom.href = href || "#";
          }
        } else if (href) {
          if (ctx.isEditing || ctx.onActionClick) {
            dom.onClick = interceptClick;
          } else {
            dom.onClick = () =>
              window.open(String(href), props.target || "_self");
          }
        }
      } else if (action === "vcard" || node.id === "saveContact") {
        if (ctx.isEditing || ctx.onActionClick) {
          dom.onClick = interceptClick;
        } else {
          dom.onClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            ctx.track({ type: "VCARD_DOWNLOAD" });
          };
        }
      } else if (action === "connect" || node.id === "connectNow") {
        if (ctx.isEditing || ctx.onActionClick) {
          dom.onClick = interceptClick;
        } else {
          dom.onClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            ctx.track({ type: "CONNECT_CLICK" });
          };
        }
      } else if (action === "carousel-prev" || action === "carousel-next" || action === "carousel-dot") {
        dom.onClick = interceptClick;
      } else if (action === "share") {
        if (ctx.isEditing || ctx.onActionClick) {
          dom.onClick = interceptClick;
        } else {
          dom.onClick = async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: "My Digital Business Card",
                  url: window.location.href,
                });
              } catch (err) {
                console.error("Share failed", err);
              }
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard");
            }
          };
        }
      } else if (action === "popup") {
        dom["data-popup"] = props.popup ?? "";
        if (ctx.onActionClick && !ctx.isEditing) {
          dom.onClick = interceptClick;
        } else if (!ctx.isEditing) {
          dom.onClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const el = document.getElementById(props.popup as string);
            if (el) el.style.display = "flex";
          };
        }
      } else if (action && action !== "link") {
        if (ctx.isEditing || ctx.onActionClick) {
          dom.onClick = interceptClick;
        }
      }
      if (node.tag === "button") dom.type = "button";
      children = props.label ?? null;
      break;
    }
    case "divider":
    case "spacer":
      // Void — never given children, so React doesn't complain about hr/img.
      return React.createElement(tag, dom);
    default:
      break;
  }

  // Void DOM tags (img, hr, br, input) and any node that already sets
  // dangerouslySetInnerHTML (richtext, embed) must NOT receive children —
  // React 19 / Next 16 turn that into a hard error rather than a warning.
  if (VOID_DOM_TAGS.has(tag) || dom.dangerouslySetInnerHTML) {
    return React.createElement(tag, dom);
  }

  return React.createElement(
    tag,
    dom,
    <>
      {children}
      {node.children?.map((child) => (
        <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
      ))}
      {node.id === ctx.rootId && !ctx.placeholderId && ctx.renderUserBlocks && ctx.renderUserBlocks()}
    </>,
  );
}

// ─── Widgets ─────────────────────────────────────────────────────────────────

/**
 * The wrapper element IS the node.
 *
 * It carries `n<id>`, so the node's own style lands on it, and `cls()` returns
 * only `p-<part>`. That separation matters: when every part also carried
 * `n<id>`, a node-level `background` painted itself onto every inner element of
 * the widget, and `.n<id> .p-root` could never match at all.
 */
function GatedWidgetUpsell({
  node,
  ctx,
}: {
  node: WidgetNode;
  ctx: RenderCtx;
}) {
  return (
    <div
      className={`n${node.id} ts-gated-upsell`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      data-gated="true"
      style={{
        padding: "16px",
        borderRadius: "8px",
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Pro Feature
      </div>
      <div style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
        {node.label || node.widget} is locked on current plan
      </div>
    </div>
  );
}

function mergeLayoutTrees(instance: ElementNode, defaultLayout: ElementNode): ElementNode {
  const merged: ElementNode = { ...instance };
  const defaultChildrenMap = new Map<string, ElementNode>();
  if (defaultLayout.children) {
    for (const c of defaultLayout.children) {
      if (c.id) defaultChildrenMap.set(c.id, c as ElementNode);
    }
  }

  if (merged.children && merged.children.length > 0) {
    merged.children = merged.children.map((child) => {
      if (child.kind === "element") {
        const defaultChild = defaultChildrenMap.get(child.id);
        if (defaultChild) {
          return mergeLayoutTrees(child as ElementNode, defaultChild);
        }
      }
      return child;
    });
  } else if (defaultLayout.children && defaultLayout.children.length > 0) {
    merged.children = structuredClone(defaultLayout.children);
  }

  return merged;
}

function WidgetRenderer({
  node,
  content,
  ctx,
}: {
  node: WidgetNode;
  content: any;
  ctx: RenderCtx;
}) {
  const isGated =
    ctx.gatedWidgetKeys?.includes(node.key) ||
    ctx.gatedWidgetKeys?.includes(node.widget);

  if (isGated && !ctx.isEditing) {
    return <GatedWidgetUpsell node={node} ctx={ctx} />;
  }

  // If rendering a user card (not editing template in builder) and blocks array is passed:
  if (!ctx.isEditing && Array.isArray(ctx.blocks)) {
    const w = node.widget?.toUpperCase() || "";

    // Primary card widgets are driven by card data (links, profile, vcard, etc.):
    const isCoreWidget = [
      "PROFILE",
      "CONNECT_BUTTONS",
      "HEADER",
      "NAV",
      "CONTACT_LINKS",
      "CONTACT_BUTTONS",
      "LINK_BUTTONS",
      "CUSTOM_LINKS",
      "LINKS",
      "SOCIAL_ICONS",
      "SOCIAL_LINKS",
      "SOCIAL",
      "COPYRIGHT",
      "VCARD_BUTTON",
      "SHARE_BUTTON",
    ].includes(w);

    if (isCoreWidget) {
      // CONTACT_LINKS / LINK_BUTTONS / LINKS check if user has links or blocks
      if (
        [
          "CONTACT_LINKS",
          "CONTACT_BUTTONS",
          "LINK_BUTTONS",
          "CUSTOM_LINKS",
          "LINKS",
        ].includes(w)
      ) {
        const hasLinks = Array.isArray(ctx.links) && ctx.links.length > 0;
        const hasBlock = ctx.blocks.some(
          (b) =>
            b.type === "LINKS" ||
            b.type === "LINK_BUTTONS" ||
            b.type === "CONTACT_LINKS" ||
            b.widget === "LINKS" ||
            b.widget === "CONTACT_LINKS",
        );
        if (!hasLinks && !hasBlock) return null;
      }
      // SOCIAL_ICONS check if user has social links or blocks
      else if (["SOCIAL_ICONS", "SOCIAL_LINKS", "SOCIAL"].includes(w)) {
        const hasSocialLinks =
          Array.isArray(ctx.links) &&
          ctx.links.some(
            (l) =>
              l.group === "social" ||
              [
                "instagram",
                "facebook",
                "twitter",
                "x",
                "linkedin",
                "youtube",
                "tiktok",
                "github",
                "whatsapp",
                "telegram",
                "discord",
                "pinterest",
              ].some((platform) =>
                (l.type || l.title || l.url || "")
                  .toLowerCase()
                  .includes(platform),
              ),
          );
        const hasBlock = ctx.blocks.some(
          (b) =>
            b.type === "SOCIAL" ||
            b.type === "SOCIAL_ICONS" ||
            b.widget === "SOCIAL",
        );
        if (!hasSocialLinks && !hasBlock) return null;
      }
    } else {
      // Optional block widgets (FAQ, Gallery, Contact Form, Video, Custom HTML, etc.)
      if (!ctx.isRenderingUserBlocks) {
        if (node.id === ctx.placeholderId && ctx.renderUserBlocks && !ctx.injectBefore) {
          return <>{ctx.renderUserBlocks()}</>;
        }
        return null;
      }
    }
  }

  const Widget = WIDGET_RENDERERS[
    node.widget as keyof typeof WIDGET_RENDERERS
  ] as any;

  const widgetMeta = getWidgetMeta(node.widget);
  const widgetContent = content?.[node.key] ?? node.defaultContent ?? {};

  // For derived widgets that have NO defaultLayout defined in their meta,
  // skip any stored node.layout and use the React render component directly.
  // This handles CONTACT_LINKS (and similar) where the old defaultLayout was
  // removed from meta — without this, a stale node.layout from the DB would
  // keep rendering an element tree with broken self-bindings, invisible labels,
  // and confusing link icons in the editor layers panel.
  // Derived widgets that DO have a defaultLayout (e.g. PROFILE) are unaffected.
  // Also applies to deprecated widgets: if they have a defaultLayout, render it.
  const hasMetaLayout = widgetMeta?.defaultLayout != null;
  const skipStoredLayout = widgetMeta?.derived === true && !hasMetaLayout;
  const layout = skipStoredLayout
    ? undefined
    : node.layout && widgetMeta?.defaultLayout
      ? mergeLayoutTrees(node.layout, widgetMeta.defaultLayout)
      : node.layout ?? widgetMeta?.defaultLayout;

  // Deprecated widgets or widgets without a custom renderer fall back to layout tree.
  if (layout) {
    const mergedLayout: ElementNode = {
      ...layout,
      style: {
        ...(layout.style ?? {}),
        ...(node.style ?? {}),
        base: {
          ...(layout.style?.base ?? {}),
          ...(node.style?.base ?? {}),
        },
      },
    };
    return (
      <div
        className={`n${node.id}`}
        data-widget={node.widget}
        data-node-id={ctx.isEditing ? node.id : undefined}
      >
        <NodeRenderer
          node={mergedLayout}
          content={{ [node.key]: widgetContent, _design: node.design }}
          ctx={{ ...ctx, selfData: widgetContent }}
        />
      </div>
    );
  }

  // No layout and no custom Widget renderer — this shouldn't happen in normal flow
  // (all widgets have either a layout or a renderer), but handle it gracefully.
  if (!Widget) {
    return (
      <div
        className={`n${node.id}`}
        data-node-id={ctx.isEditing ? node.id : undefined}
        data-widget={node.widget}
      >
        {ctx.isEditing ? `Unknown widget: ${node.widget}` : null}
      </div>
    );
  }

  const design = node.design ?? {};
  const cls = (part: string) => `p-${part}`;

  const renderedWidget = (
    <div
      className={`n${node.id}`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      data-widget={node.widget}
    >
      <Widget
        content={widgetContent}
        design={design}
        cls={cls}
        ctx={ctx}
      />
    </div>
  );

  if (!ctx.isEditing && Array.isArray(ctx.blocks) && node.id === ctx.placeholderId && ctx.injectBefore && ctx.renderUserBlocks) {
    return (
      <React.Fragment>
        {ctx.renderUserBlocks()}
        {renderedWidget}
      </React.Fragment>
    );
  }

  return renderedWidget;
}

// ─── Slots ───────────────────────────────────────────────────────────────────

function SlotRenderer({
  node,
  content,
  ctx,
}: {
  node: SlotNode;
  content: any;
  ctx: RenderCtx;
}) {
  const items: any[] = content?.[node.key]?.items ?? [];

  return (
    <div
      className={`n${node.id}`}
      data-node-id={ctx.isEditing ? node.id : undefined}
      data-slot={node.key}
      data-empty={items.length === 0 ? "true" : undefined}
    >
      {items.map((item, i) => (
        <NodeRenderer
          key={item.id ?? i}
          node={item}
          content={content}
          ctx={ctx}
        />
      ))}
      {ctx.isEditing &&
        items.length === 0 &&
        `Empty slot: ${node.label || node.key}`}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function clampLevel(level: unknown): number {
  const n = Number(level);
  return Number.isFinite(n) && n >= 1 && n <= 6 ? Math.floor(n) : 2;
}
