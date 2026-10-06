"use client";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import React from "react";
import type { ElementNode, Node, SlotNode, WidgetNode } from "../types/node";
import { getWidgetMeta } from "../widgets";
import { isCoreWidget, isWidgetHiddenOnCard } from "./card-visibility";
import { resolveBinding } from "./resolveBinding";
import { safeHref, sanitizeHtml } from "./sanitize";
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
  /** Template elements that would be empty chrome on this card — skipped. */
  collapsedIds?: Set<string>;
}

export interface NodeRendererProps {
  node: Node;
  content: any;
  ctx: RenderCtx;
}

export function NodeRenderer({ node, content, ctx }: NodeRendererProps) {
  if (ctx.collapsedIds?.has(node.id)) return null;
  if (node.kind === "element")
    return <ElementRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === "widget")
    return <WidgetRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === "slot")
    return <SlotRenderer node={node} content={content} ctx={ctx} />;
  return null;
}

export const CarouselContext = React.createContext<{
  emblaApi?: any;
  emblaRef?: any;
  selectedIndex?: number;
} | null>(null);

function CarouselProvider({ node, content, ctx, dom }: any) {
  const align = content?._design?.carouselAlign ?? "start";
  const loop = content?._design?.carouselLoop === true;
  const autoplay = content?._design?.carouselAutoplay === true;
  const autoplayDelay = Number(content?._design?.carouselAutoplayDelay) || 3000;

  const plugins = React.useMemo(() => {
    return [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: true,
        active: autoplay,
      }),
    ];
  }, [autoplay, autoplayDelay]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop, align, containScroll: false },
    plugins,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({ loop, align, containScroll: false }, plugins);
      const autoplayPlugin = emblaApi.plugins().autoplay;
      if (autoplayPlugin) {
        if (autoplay) {
          autoplayPlugin.play();
        } else {
          autoplayPlugin.stop();
        }
      }
    }
  }, [emblaApi, align, loop, plugins, autoplay]);

  const kids = (node.children ?? []).map((child: any) => (
    <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
  ));
  return (
    <CarouselContext.Provider value={{ emblaApi, emblaRef, selectedIndex }}>
      <div {...dom}>{kids}</div>
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

/**
 * The only `node.props` keys that reach the DOM (plus `data-*` / `aria-*`).
 *
 * Templates are JSON and can be imported from a file, so forwarding every key
 * let `props.dangerouslySetInnerHTML`, `srcdoc`, `formaction`… through as raw
 * HTML/attributes. `href`/`src` are handled per tag with URL checks instead.
 */
const DOM_PROPS = new Set([
  "title",
  "alt",
  "target",
  "rel",
  "placeholder",
  "width",
  "height",
  "tabIndex",
  "role",
]);

function isForwardableProp(key: string, value: unknown): boolean {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    return false;
  }
  return DOM_PROPS.has(key) || /^(data|aria)-[a-z0-9-]+$/.test(key);
}

/** Tags a `frame` may render as via `props.as` — semantic containers only. */
const FRAME_AS = new Set([
  "div",
  "section",
  "header",
  "footer",
  "nav",
  "main",
  "article",
  "aside",
  "figure",
  "ul",
  "ol",
  "li",
  "span",
]);

/** A bound value that is a link target rather than display text. */
function looksLikeUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^(https?:|mailto:|tel:|sms:|\/|#)/i.test(value.trim())
  );
}

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
    const val = content?._design?.[key] ?? ctx.selfData?.[key];
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
  // absent bio leaving a gap in the layout. But if the node has fallback static
  // props (props.src, props.text, props.html), keep it so templates show placeholders.
  if (
    node.hideIfEmpty &&
    isEmpty(bound) &&
    !props.src &&
    !props.text &&
    !props.html
  ) {
    return null;
  }

  const tag =
    node.tag === "frame"
      ? FRAME_AS.has(String(props.as))
        ? String(props.as)
        : "div"
      : node.tag === "heading"
        ? `h${clampLevel(props.level)}`
        : TAG_MAP[node.tag] || "div";

  let isCarouselDotActive = false;
  if (
    props.action === "carousel-dot" &&
    ctxEmbla?.selectedIndex === ctx.repeatIndex
  ) {
    isCarouselDotActive = true;
  }

  const customClass =
    typeof props.className === "string" && props.className.trim()
      ? ` ${props.className}`
      : "";
  const dom: Record<string, any> = {
    className: `n${node.id} p-${node.id}${isCarouselDotActive ? " p-carouselDotActive" : ""}${customClass}`,
  };

  // Only forward allowlisted, primitive attributes.
  for (const [key, value] of Object.entries(props)) {
    if (ENGINE_PROPS.has(key) || key === "className") continue;
    if (isForwardableProp(key, value)) dom[key] = value;
  }

  if (ctx.isEditing) dom["data-node-id"] = node.id;
  if (node.a11y?.role) dom.role = node.a11y.role;
  if (node.a11y?.label) dom["aria-label"] = node.a11y.label;

  let children: React.ReactNode = null;

  switch (node.tag) {
    case "carousel-root": {
      return (
        <CarouselProvider node={node} content={content} ctx={ctx} dom={dom} />
      );
    }
    case "carousel": {
      const perView = Number(content?._design?.carouselSlidesPerView) || 1.25;
      const widthPct = 100 / perView;
      const trackId = `track-${node.id}`;
      const kids = (node.children ?? []).map((child) => (
        <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
      ));

      return (
        <React.Fragment>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .${trackId} {
              gap: 0 !important;
              margin-left: calc(-1 * var(--space-3, 0.75rem)) !important;
            }
            .${trackId} > div {
              flex: 0 0 ${widthPct}% !important;
              min-width: 0 !important;
              padding-left: var(--space-3, 0.75rem) !important;
              box-sizing: border-box !important;
            }
          `,
            }}
          />
          <div
            className="embla"
            ref={ctxEmbla?.emblaRef}
            style={{ overflow: "hidden" }}
          >
            <div {...dom} className={`${dom.className} ${trackId}`}>
              {kids}
            </div>
          </div>
        </React.Fragment>
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

      const ratio = content?._design?.ratio;
      if (ratio && ratio !== "auto") {
        dom.style = { ...dom.style, aspectRatio: ratio };
      }
      const fit = content?._design?.fit;
      if (fit) {
        dom.style = { ...dom.style, objectFit: fit };
      }
      break;
    }
    case "icon": {
      // The glyph name can come from a binding (composite widget content) or a
      // static prop. Bound wins so an icon leaf renders the user's chosen icon.
      const iconName = bound ?? props.name ?? "";
      dom["data-icon"] =
        typeof iconName === "string"
          ? iconName
          : ((iconName as any)?.name ?? "");
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
        __html: sanitizeHtml(String(rawHtml), "richtext"),
      };
      break;
    }
    case "embed": {
      const rawHtml = bound ?? props.html ?? "";
      dom.dangerouslySetInnerHTML = {
        __html: sanitizeHtml(String(rawHtml), "embed"),
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
            poster={(ctx.selfData?.thumbnail as string) || undefined}
            controls={props.controls}
            autoPlay={props.autoplay}
            loop={props.loop}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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

      // A bound value is the link target when it looks like a URL; otherwise
      // (e.g. a button bound to its label text) it is display text. Treating
      // every bound value as a URL made labelled buttons render empty and
      // `window.open("Choose a time")` on click.
      const boundIsUrl = looksLikeUrl(bound);
      const href = safeHref(boundIsUrl ? bound : props.href) ?? undefined;
      const boundLabel =
        !boundIsUrl && (typeof bound === "string" || typeof bound === "number")
          ? String(bound)
          : null;

      if (
        action === "link" &&
        node.id !== "connectNow" &&
        node.id !== "saveContact"
      ) {
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
              window.open(
                href,
                props.target === "_blank" ? "_blank" : "_self",
                props.target === "_blank" ? "noopener,noreferrer" : undefined,
              );
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
      } else if (
        action === "carousel-prev" ||
        action === "carousel-next" ||
        action === "carousel-dot"
      ) {
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
      if (node.tag === "link" && props.target === "_blank") {
        dom.target = "_blank";
        dom.rel = "noopener noreferrer";
      }
      children = props.label ?? boundLabel;
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
      {node.id === ctx.rootId &&
        !ctx.placeholderId &&
        ctx.renderUserBlocks &&
        ctx.renderUserBlocks()}
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

/**
 * Structure comes from the widget's code, not the stored copy: the builder
 * never edits a layout node's tag/binding, so a stored layout only diverges
 * from the default when the default was fixed later. Taking these from the
 * default lets such fixes reach templates saved before them; style, props and
 * hidden stay the instance's (that is what the admin edits).
 */
export function structuralFrom(def: ElementNode): Partial<ElementNode> {
  const out: Partial<ElementNode> = { tag: def.tag };
  if (def.bind !== undefined) out.bind = def.bind;
  if (def.repeat !== undefined) out.repeat = def.repeat;
  if (def.hideIfEmpty !== undefined) out.hideIfEmpty = def.hideIfEmpty;
  if (def.visibleIf !== undefined) out.visibleIf = def.visibleIf;
  return out;
}

function mergeLayoutTrees(
  instance: ElementNode,
  defaultLayout: ElementNode,
): ElementNode {
  let instChildren = instance.children;
  // Backward compatibility: If instance has a single wrapper child like "list"
  // but defaultLayout has its items (like "item") directly under root, unwrap the list wrapper.
  if (
    instChildren &&
    instChildren.length === 1 &&
    instChildren[0].kind === "element" &&
    instChildren[0].id === "list" &&
    defaultLayout.children?.some((c) => c.id === "item") &&
    !defaultLayout.children?.some((c) => c.id === "list")
  ) {
    const listNode = instChildren[0] as ElementNode;
    instChildren = listNode.children || [];
  }

  const merged: ElementNode = {
    ...instance,
    // Same id ⇒ same node; a different id (e.g. the admin wrapped the layout
    // in a new frame) is the admin's own structure and is left alone.
    ...(instance.id === defaultLayout.id ? structuralFrom(defaultLayout) : {}),
    children: instChildren,
  };
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

  // On a user card (blocks passed, not the builder): optional block widgets
  // (FAQ, Gallery, Contact Form…) only render through the user's blocks, and
  // links/social widgets with nothing to show disappear.
  if (!ctx.isEditing && Array.isArray(ctx.blocks)) {
    if (
      !isCoreWidget(node.widget) &&
      !ctx.isRenderingUserBlocks &&
      node.id === ctx.placeholderId &&
      ctx.renderUserBlocks &&
      !ctx.injectBefore
    ) {
      return <>{ctx.renderUserBlocks()}</>;
    }
    if (isWidgetHiddenOnCard(node, ctx)) return null;
  }

  // Tag every analytics event from this widget with its stable node key so
  // the backend can attribute clicks to the specific widget instance
  // (dynamic per-widget analytics).
  //
  // `collapsedIds` holds TEMPLATE ids; a widget's layout reuses short ids
  // ("root", "title", "item"…) that could collide, so it stops here.
  const widgetCtx: RenderCtx = {
    ...ctx,
    collapsedIds: undefined,
    track: (event: Record<string, unknown>) =>
      ctx.track({ widgetKey: node.key, ...event }),
  };

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
      : (node.layout ?? widgetMeta?.defaultLayout);

  // Deprecated widgets or widgets without a custom renderer fall back to layout tree.
  if (layout) {
    // Only the part class. Every layout root is id "root" — the same id as the
    // template root — so also stamping `n<layoutId>` made the TEMPLATE root's
    // `.ts-card .nroot{padding;border;background…}` rule hit every widget.
    // The layout root's own style is compiled onto `.n<widgetId>` instead.
    const layoutClasses = [
      layout.id ? `p-${layout.id}` : "",
      layout.props?.className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const mergedLayout: ElementNode = {
      ...layout,
      id: node.id,
      props: {
        ...(layout.props || {}),
        "data-widget": node.widget,
        ...(layoutClasses ? { className: layoutClasses } : {}),
      },
      style: {
        ...(layout.style ?? {}),
        ...(node.style ?? {}),
        base: {
          ...(layout.style?.base ?? {}),
          ...(node.style?.base ?? {}),
        },
        sm: {
          ...(layout.style?.sm ?? {}),
          ...(node.style?.sm ?? {}),
        },
        md: {
          ...(layout.style?.md ?? {}),
          ...(node.style?.md ?? {}),
        },
      },
    };

    const renderedLayout = (
      <NodeRenderer
        node={mergedLayout}
        content={{
          // Keep the card-level content visible inside the layout so a widget
          // nested here (e.g. Connect Buttons in Profile) still finds its own
          // content by key.
          ...(content ?? {}),
          [node.key]: widgetContent,
          _design: { ...(node.design || {}), ...(widgetContent || {}) },
        }}
        ctx={{ ...widgetCtx, selfData: widgetContent }}
      />
    );

    if (
      !ctx.isEditing &&
      Array.isArray(ctx.blocks) &&
      node.id === ctx.placeholderId &&
      ctx.injectBefore &&
      ctx.renderUserBlocks
    ) {
      return (
        <React.Fragment>
          {ctx.renderUserBlocks()}
          {renderedLayout}
        </React.Fragment>
      );
    }

    return renderedLayout;
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
  const cls = (part: string) => `p-${part} n${part}`;

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
        ctx={widgetCtx}
      />
    </div>
  );

  if (
    !ctx.isEditing &&
    Array.isArray(ctx.blocks) &&
    node.id === ctx.placeholderId &&
    ctx.injectBefore &&
    ctx.renderUserBlocks
  ) {
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
