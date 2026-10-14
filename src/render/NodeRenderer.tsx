"use client";
import React from "react";
import type { ElementNode, Node, SlotNode, WidgetNode } from "../types/node";
import { getWidgetMeta } from "../widgets";
import { CAROUSEL_PART_COUNTERPARTS } from "../widgets/carousel-parts";
import {
  isCoreWidget,
  isCustomBlockSourceHidden,
  isWidgetHiddenOnCard,
} from "./card-visibility";
import { resolveBinding } from "./resolveBinding";
import { safeHref, sanitizeHtml } from "./sanitize";
import { WIDGET_RENDERERS } from "./widgets";
import { RenderIcon } from "./widgets/icon-helper";
import { blockClass } from "../blocks/resolve-design";

export interface RenderCtx {
  card: any;
  links: any[];
  blocks?: any[];
  /** Template node id → the user's blocks rendered in that node's place. */
  blockNodeMap?: Map<string, any[]>;
  renderBlocks?: (blocks: any[]) => React.ReactNode;
  /** node.id → block.position — used to sort widget siblings in user-order */
  blockPositionMap?: Map<string, number>;
  renderBlock?: (block: any) => React.ReactNode;
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
  /**
   * Template layers that are the source of a custom block. Like optional
   * widgets, on a user card they only render through the user's blocks.
   */
  customBlockSourceIds?: Set<string>;
  isCarouselSlide?: boolean;
  carouselPerView?: number;
}

export interface NodeRendererProps {
  node: Node;
  content: any;
  ctx: RenderCtx;
}

export function NodeRenderer({ node, content, ctx }: NodeRendererProps) {
  // A template spot the user's blocks were assigned to renders them in its
  // place (see CardRenderer's anchoring).
  if (
    !ctx.isEditing &&
    !ctx.isRenderingUserBlocks &&
    ctx.renderBlocks &&
    ctx.blockNodeMap?.has(node.id)
  ) {
    return <>{ctx.renderBlocks(ctx.blockNodeMap.get(node.id)!)}</>;
  }
  if (ctx.collapsedIds?.has(node.id)) return null;
  if (isCustomBlockSourceHidden(node.id, ctx)) return null;
  if (node.kind === "element")
    return <ElementRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === "widget")
    return <WidgetRenderer node={node} content={content} ctx={ctx} />;
  if (node.kind === "slot")
    return <SlotRenderer node={node} content={content} ctx={ctx} />;
  return null;
}

export const CarouselContext = React.createContext<{
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  trackRef?: React.RefObject<HTMLDivElement | null>;
  selectedIndex?: number;
  canScrollPrev?: boolean;
  canScrollNext?: boolean;
  loop?: boolean;
  isInfinite?: boolean;
  perView?: number;
  originalSlideCount?: number;
  scrollNext?: () => void;
  scrollPrev?: () => void;
  scrollTo?: (idx: number) => void;
  dragProps?: Record<string, any>;
} | null>(null);

function CarouselProvider({ node, content, ctx, dom }: any) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const trackChild = (node.children || []).find(
    (c: any) => c.tag === "carousel" || c.id === "carouselTrack",
  );

  const align =
    content?._design?.carouselAlign ??
    ctx.selfData?._design?.carouselAlign ??
    ctx.selfData?.carouselAlign ??
    node.props?.carouselAlign ??
    trackChild?.props?.carouselAlign ??
    node.props?.align ??
    trackChild?.props?.align ??
    "start";

  const perView =
    Number(
      content?._design?.carouselSlidesPerView ??
        ctx.selfData?._design?.carouselSlidesPerView ??
        ctx.selfData?.carouselSlidesPerView ??
        node.props?.carouselSlidesPerView ??
        trackChild?.props?.carouselSlidesPerView ??
        node.props?.slidesPerView ??
        trackChild?.props?.slidesPerView ??
        node.props?.perView ??
        trackChild?.props?.perView,
    ) || 1.25;

  const loopCandidate =
    node.props?.carouselLoop ??
    trackChild?.props?.carouselLoop ??
    content?._design?.carouselLoop ??
    ctx.selfData?._design?.carouselLoop ??
    ctx.selfData?.carouselLoop;
  const loop = loopCandidate !== undefined ? Boolean(loopCandidate) : true;

  const autoplayCandidate =
    node.props?.carouselAutoplay ??
    trackChild?.props?.carouselAutoplay ??
    content?._design?.carouselAutoplay ??
    ctx.selfData?._design?.carouselAutoplay ??
    ctx.selfData?.carouselAutoplay;
  const autoplay =
    autoplayCandidate !== undefined ? Boolean(autoplayCandidate) : false;

  const autoplayDelay =
    Number(
      content?._design?.carouselAutoplayDelay ??
        ctx.selfData?._design?.carouselAutoplayDelay ??
        ctx.selfData?.carouselAutoplayDelay ??
        node.props?.carouselAutoplayDelay ??
        trackChild?.props?.carouselAutoplayDelay ??
        node.props?.autoplayDelay ??
        trackChild?.props?.autoplayDelay,
    ) || 3000;

  let rawItems: any[] = [];
  const repeatedNode = (trackChild?.children || []).find((c: any) => c.repeat);
  if (repeatedNode?.repeat) {
    const bound = resolveBinding(
      repeatedNode.repeat,
      ctx.card,
      content,
      ctx.selfData,
    );
    if (Array.isArray(bound)) {
      rawItems = bound;
    }
  }
  if (!rawItems.length) {
    if (Array.isArray(ctx.selfData?.items)) rawItems = ctx.selfData.items;
    else if (Array.isArray(ctx.selfData?.images))
      rawItems = ctx.selfData.images;
    else if (Array.isArray(ctx.selfData?.videos))
      rawItems = ctx.selfData.videos;
    else if (Array.isArray(ctx.selfData?.testimonials))
      rawItems = ctx.selfData.testimonials;
    else if (Array.isArray(ctx.selfData?.links)) rawItems = ctx.selfData.links;
    else if (Array.isArray(content?.items)) rawItems = content.items;
    else if (Array.isArray(content?.images)) rawItems = content.images;
    else if (Array.isArray(content?.videos)) rawItems = content.videos;
    else if (Array.isArray(content?.testimonials))
      rawItems = content.testimonials;
    else if (node.key && Array.isArray(content?.[node.key]?.items))
      rawItems = content[node.key].items;
    else if (node.key && Array.isArray(content?.[node.key]?.images))
      rawItems = content[node.key].images;
    else if (trackChild?.children?.length) rawItems = trackChild.children;
  }
  const originalSlideCount = rawItems.length || 1;
  const isInfinite = loop && originalSlideCount >= 2;

  const initialIndex = isInfinite ? originalSlideCount : 0;
  const indexRef = React.useRef(initialIndex);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(true);
  const [canScrollNext, setCanScrollNext] = React.useState(true);
  const transitionTimerRef = React.useRef<any>(null);
  const resetAutoplayTimerRef = React.useRef<() => void>(() => {});

  const getStep = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const firstSlide = (track.querySelector(".ts-carousel-slide") ||
      track.firstElementChild) as HTMLElement | null;
    const gap = 12;
    if (firstSlide && firstSlide.offsetWidth > 0) {
      return firstSlide.offsetWidth + gap;
    }
    const container = viewportRef.current || track.parentElement || track;
    const containerWidth = container.clientWidth || 300;
    const calculatedSlideWidth =
      perView === 1
        ? containerWidth
        : (containerWidth - (perView - 1) * gap) / perView;
    return Math.max(calculatedSlideWidth + gap, 50);
  }, [perView]);

  const applyTransform = React.useCallback(
    (offset: number, withTransition = false, duration = 350) => {
      const track = trackRef.current;
      if (!track) return;
      if (withTransition) {
        track.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
      } else {
        track.style.transition = "none";
      }
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    },
    [],
  );

  const checkLoopSettle = React.useCallback(() => {
    if (!isInfinite) return;
    const track = trackRef.current;
    if (!track) return;
    const N = originalSlideCount;
    const step = getStep();
    if (step <= 0) return;

    if (indexRef.current >= 2 * N) {
      indexRef.current -= N;
      applyTransform(indexRef.current * step, false);
      void track.offsetHeight;
    } else if (indexRef.current < N) {
      indexRef.current += N;
      applyTransform(indexRef.current * step, false);
      void track.offsetHeight;
    }
  }, [applyTransform, getStep, isInfinite, originalSlideCount]);

  // Initial position and resize handling
  React.useEffect(() => {
    const step = getStep();
    if (step > 0) {
      applyTransform(indexRef.current * step, false);
    }
    const realIdx = isInfinite
      ? ((indexRef.current % originalSlideCount) + originalSlideCount) %
        originalSlideCount
      : indexRef.current;
    setSelectedIndex(realIdx);
    if (!isInfinite) {
      setCanScrollPrev(indexRef.current > 0);
      setCanScrollNext(indexRef.current < originalSlideCount - 1);
    }
  }, [applyTransform, getStep, isInfinite, originalSlideCount]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;

    let initial = true;
    const ro = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        return;
      }
      const step = getStep();
      if (step > 0) {
        applyTransform(indexRef.current * step, false);
      }
    });
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [applyTransform, getStep]);

  // Transition end listener on track
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== track || e.propertyName !== "transform") return;
      clearTimeout(transitionTimerRef.current);
      checkLoopSettle();
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      clearTimeout(transitionTimerRef.current);
    };
  }, [checkLoopSettle]);

  const scrollNext = React.useCallback(() => {
    resetAutoplayTimerRef.current?.();
    const track = trackRef.current;
    if (!track) return;
    const step = getStep();
    if (step <= 0) return;
    const N = originalSlideCount;

    if (isInfinite) {
      if (indexRef.current >= 3 * N - 1) {
        indexRef.current -= N;
        applyTransform(indexRef.current * step, false);
        void track.offsetHeight;
      }
      indexRef.current += 1;
      applyTransform(indexRef.current * step, true, 350);
      const realIdx = ((indexRef.current % N) + N) % N;
      setSelectedIndex(realIdx);

      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(checkLoopSettle, 400);
    } else {
      const maxIndex = Math.max(0, N - 1);
      if (indexRef.current >= maxIndex) return;
      indexRef.current += 1;
      applyTransform(indexRef.current * step, true, 350);
      setSelectedIndex(indexRef.current);
      setCanScrollPrev(indexRef.current > 0);
      setCanScrollNext(indexRef.current < maxIndex);
    }
  }, [
    applyTransform,
    checkLoopSettle,
    getStep,
    isInfinite,
    originalSlideCount,
  ]);

  const scrollPrev = React.useCallback(() => {
    resetAutoplayTimerRef.current?.();
    const track = trackRef.current;
    if (!track) return;
    const step = getStep();
    if (step <= 0) return;
    const N = originalSlideCount;

    if (isInfinite) {
      if (indexRef.current <= 0) {
        indexRef.current += N;
        applyTransform(indexRef.current * step, false);
        void track.offsetHeight;
      }
      indexRef.current -= 1;
      applyTransform(indexRef.current * step, true, 350);
      const realIdx = ((indexRef.current % N) + N) % N;
      setSelectedIndex(realIdx);

      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(checkLoopSettle, 400);
    } else {
      if (indexRef.current <= 0) return;
      indexRef.current -= 1;
      applyTransform(indexRef.current * step, true, 350);
      setSelectedIndex(indexRef.current);
      setCanScrollPrev(indexRef.current > 0);
      setCanScrollNext(indexRef.current < Math.max(0, N - 1));
    }
  }, [
    applyTransform,
    checkLoopSettle,
    getStep,
    isInfinite,
    originalSlideCount,
  ]);

  const scrollTo = React.useCallback(
    (target: number) => {
      resetAutoplayTimerRef.current?.();
      const track = trackRef.current;
      if (!track) return;
      const step = getStep();
      if (step <= 0) return;
      const N = originalSlideCount;

      const targetIdx = isInfinite
        ? N + target
        : Math.max(0, Math.min(N - 1, target));
      indexRef.current = targetIdx;
      applyTransform(targetIdx * step, true, 350);
      setSelectedIndex(target);
      if (!isInfinite) {
        setCanScrollPrev(targetIdx > 0);
        setCanScrollNext(targetIdx < Math.max(0, N - 1));
      }

      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(checkLoopSettle, 400);
    },
    [applyTransform, checkLoopSettle, getStep, isInfinite, originalSlideCount],
  );

  // Pointer drag implementation
  const isPointerDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startOffsetRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const hasMovedRef = React.useRef(false);
  const lastXRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);
  const velocityRef = React.useRef(0);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const track = trackRef.current;
      if (!track) return;

      clearTimeout(transitionTimerRef.current);

      const style = window.getComputedStyle(track);
      const transform = style.transform;
      let currentX = -indexRef.current * getStep();
      if (transform && transform !== "none") {
        try {
          const matrix = new DOMMatrixReadOnly(transform);
          currentX = matrix.m41;
        } catch {}
      }
      applyTransform(-currentX, false);

      isPointerDownRef.current = true;
      isDraggingRef.current = false;
      hasMovedRef.current = false;
      startXRef.current = e.clientX;
      startOffsetRef.current = -currentX;
      lastXRef.current = e.clientX;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
    },
    [applyTransform, getStep],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      const track = trackRef.current;
      if (!track) return;

      const deltaX = e.clientX - startXRef.current;
      if (!isDraggingRef.current && Math.abs(deltaX) > 4) {
        isDraggingRef.current = true;
        hasMovedRef.current = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        if (viewportRef.current) {
          viewportRef.current.style.cursor = "grabbing";
        }
      }

      if (isDraggingRef.current) {
        let currentOffset = startOffsetRef.current - deltaX;
        const step = getStep();
        const N = originalSlideCount;

        if (!isInfinite) {
          const maxOffset = Math.max(0, N - 1) * step;
          if (currentOffset < 0) {
            currentOffset = currentOffset * 0.35;
          } else if (currentOffset > maxOffset) {
            currentOffset = maxOffset + (currentOffset - maxOffset) * 0.35;
          }
        }

        applyTransform(currentOffset, false);

        const now = performance.now();
        const dt = now - lastTimeRef.current;
        if (dt > 10) {
          velocityRef.current = (e.clientX - lastXRef.current) / dt;
          lastXRef.current = e.clientX;
          lastTimeRef.current = now;
        }
      }
    },
    [applyTransform, getStep, isInfinite, originalSlideCount],
  );

  const endDrag = React.useCallback(
    (e?: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;

      if (e) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
      }
      if (viewportRef.current) {
        viewportRef.current.style.cursor = "grab";
      }

      const track = trackRef.current;
      if (!track) return;

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const step = getStep();
        if (step <= 0) return;

        const style = window.getComputedStyle(track);
        let currentX = -indexRef.current * step;
        if (style.transform && style.transform !== "none") {
          try {
            const matrix = new DOMMatrixReadOnly(style.transform);
            currentX = matrix.m41;
          } catch {}
        }
        const currentOffset = -currentX;

        let targetIndex = Math.round(currentOffset / step);
        const velocity = velocityRef.current;
        if (velocity < -0.2) {
          targetIndex = Math.ceil(currentOffset / step);
        } else if (velocity > 0.2) {
          targetIndex = Math.floor(currentOffset / step);
        }

        const N = originalSlideCount;
        if (!isInfinite) {
          targetIndex = Math.max(0, Math.min(Math.max(0, N - 1), targetIndex));
        }

        indexRef.current = targetIndex;
        applyTransform(targetIndex * step, true, 350);

        const realIdx = isInfinite ? ((targetIndex % N) + N) % N : targetIndex;
        setSelectedIndex(realIdx);
        if (!isInfinite) {
          setCanScrollPrev(targetIndex > 0);
          setCanScrollNext(targetIndex < Math.max(0, N - 1));
        }

        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(checkLoopSettle, 400);
        resetAutoplayTimerRef.current?.();
      }
    },
    [applyTransform, checkLoopSettle, getStep, isInfinite, originalSlideCount],
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e);
    },
    [endDrag],
  );

  const onPointerCancel = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e);
    },
    [endDrag],
  );

  const onClickCapture = React.useCallback((e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  }, []);

  const dragProps = React.useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    }),
    [
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    ],
  );

  // Autoplay handler
  React.useEffect(() => {
    // Never auto-slide while an admin/user is editing in the builder canvas
    if (!autoplay || ctx.isEditing) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let mouseOver = false;
    let lastTypeTime = 0;

    const onUserType = () => {
      lastTypeTime = Date.now();
    };

    const isTypingOrFocused = () => {
      if (Date.now() - lastTypeTime < 4000) return true;
      if (typeof document !== "undefined" && document.activeElement) {
        const el = document.activeElement;
        const tag = el.tagName?.toLowerCase();
        if (
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          (el as HTMLElement).isContentEditable
        ) {
          return true;
        }
      }
      return false;
    };

    const tick = () => {
      if (
        !mouseOver &&
        !isDraggingRef.current &&
        !isPointerDownRef.current &&
        !isTypingOrFocused()
      ) {
        scrollNext();
      }
      timer = setTimeout(tick, autoplayDelay);
    };

    resetAutoplayTimerRef.current = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, autoplayDelay);
    };

    const viewport = viewportRef.current;
    const onEnter = () => {
      mouseOver = true;
    };
    const onLeave = () => {
      mouseOver = false;
    };

    if (viewport) {
      viewport.addEventListener("mouseenter", onEnter);
      viewport.addEventListener("mouseleave", onLeave);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onUserType, { passive: true });
      window.addEventListener("input", onUserType, { passive: true });
    }

    timer = setTimeout(tick, autoplayDelay);

    return () => {
      if (timer) clearTimeout(timer);
      if (viewport) {
        viewport.removeEventListener("mouseenter", onEnter);
        viewport.removeEventListener("mouseleave", onLeave);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onUserType);
        window.removeEventListener("input", onUserType);
      }
    };
  }, [autoplay, autoplayDelay, ctx.isEditing, scrollNext]);

  const kids = (node.children ?? []).map((child: any) => (
    <NodeRenderer key={child.id} node={child} content={content} ctx={ctx} />
  ));
  return (
    <CarouselContext.Provider
      value={{
        viewportRef,
        trackRef,
        scrollNext,
        scrollPrev,
        scrollTo,
        selectedIndex,
        canScrollPrev,
        canScrollNext,
        loop,
        isInfinite,
        perView,
        originalSlideCount,
        dragProps,
      }}
    >
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
  "prefix",
  "suffix",
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
  "a",
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
  const ctxCarousel = React.useContext(CarouselContext);
  if (node.visibleIf) {
    const { key, equals } = node.visibleIf;
    let val = content?._design?.[key] ?? ctx.selfData?.[key];
    if (
      val === undefined &&
      key === "useCarousel" &&
      (node.props as Record<string, unknown>)?.useCarousel !== undefined
    ) {
      val = (node.props as Record<string, unknown>).useCarousel;
    }
    const isVisible = val === equals || (equals === false && !val);
    if (!isVisible) return null;
  }

  if (
    node.showIf &&
    isEmpty(
      resolveBinding(
        node.showIf,
        ctx.card,
        content,
        ctx.selfData,
        ctx.repeatIndex,
      ),
    )
  ) {
    return null;
  }

  if (node.repeat) {
    const items = resolveBinding(node.repeat, ctx.card, content, ctx.selfData);
    if (!Array.isArray(items)) return null;

    const isLoopCarousel =
      ctx.isCarouselSlide && Boolean(ctxCarousel?.loop) && items.length >= 2;

    const renderItems = isLoopCarousel
      ? [
          ...items.map((it, idx) => ({
            it,
            origIdx: idx,
            cloneKey: `clone-prev-${idx}`,
          })),
          ...items.map((it, idx) => ({
            it,
            origIdx: idx,
            cloneKey: `real-${idx}`,
          })),
          ...items.map((it, idx) => ({
            it,
            origIdx: idx,
            cloneKey: `clone-next-${idx}`,
          })),
        ]
      : items.map((it, idx) => ({ it, origIdx: idx, cloneKey: undefined }));

    return (
      <React.Fragment>
        {renderItems.map(({ it: item, origIdx: index, cloneKey }) => (
          <ElementRenderer
            key={
              cloneKey
                ? `${cloneKey}-${item?.id ?? index}`
                : (item?.id ?? index)
            }
            node={{
              ...node,
              repeat: undefined,
              // First/last item hooks for the `first`/`last` style states —
              // they still match when the list shares its parent with other
              // layers, where :first-child / :last-child would miss.
              __edgeClass: isLoopCarousel
                ? undefined
                : [
                    index === 0 ? "is-first" : "",
                    index === items.length - 1 ? "is-last" : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined,
              ...(node.repeat?.source === "self" &&
              node.repeat.path === "links" &&
              typeof item?.id === "string"
                ? {
                    props: {
                      ...(node.props ?? {}),
                      "data-link-id": item.id,
                      ...(typeof item.type === "string"
                        ? { "data-link-type": item.type }
                        : {}),
                    },
                  }
                : {}),
            } as ElementNode}
            content={content}
            ctx={{
              ...ctx,
              selfData: item,
              repeatIndex: index,
              isCarouselSlide: ctx.isCarouselSlide,
            }}
          />
        ))}
      </React.Fragment>
    );
  }

  const bound = resolveBinding(
    node.bind,
    ctx.card,
    content,
    ctx.selfData,
    ctx.repeatIndex,
  );
  const props = (node.props ?? {}) as Record<string, any>;
  const isBound = Boolean(node.bind);
  const isCardBound = node.bind?.source === "card";

  // Check fallback from content/selfData by nodeId or key if unbound
  const fallbackVal =
    (node.id ? content?.[node.id] : undefined) ??
    (node.id ? ctx.selfData?.[node.id] : undefined);
  let activeVal = !isEmpty(bound) ? bound : fallbackVal;

  if (
    isEmpty(activeVal) &&
    (node.id === "itemIndex" ||
      node.id === "c_itemIndex" ||
      node.id === "index" ||
      node.id === "serial")
  ) {
    activeVal = ctx.repeatIndex !== undefined ? ctx.repeatIndex + 1 : 1;
  }
  const resolvedText =
    typeof activeVal === "object" && activeVal !== null
      ? ((activeVal as any).text ?? (activeVal as any).value ?? "")
      : activeVal;

  if (node.hideIfEmpty) {
    if (isBound) {
      const isValEmpty =
        node.tag === "image"
          ? isEmpty(bound ?? fallbackVal)
          : node.tag === "video"
            ? isEmpty(bound ?? fallbackVal)
            : isEmpty(resolvedText);
      if (isValEmpty) {
        return null;
      }
    } else {
      if (isEmpty(resolvedText) && !props.src && !props.text && !props.html) {
        return null;
      }
    }
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
    ctxCarousel?.selectedIndex !== undefined &&
    ctx.repeatIndex !== undefined
  ) {
    const origCount = ctxCarousel.originalSlideCount || 1;
    isCarouselDotActive =
      ctxCarousel.selectedIndex % origCount === ctx.repeatIndex;
  }

  const customClass =
    typeof props.className === "string" && props.className.trim()
      ? ` ${props.className}`
      : "";
  const isTemplateRoot = node.id === ctx.rootId && !ctx.isRenderingUserBlocks;
  const domNodeClass = isTemplateRoot
    ? node.id
    : node.id === "root"
      ? "elem-root"
      : node.id;
  const isSlideClass = ctx.isCarouselSlide ? " ts-carousel-slide" : "";
  const counterparts = CAROUSEL_PART_COUNTERPARTS[node.id] || [];
  const counterpartClasses =
    counterparts.length > 0
      ? " " + counterparts.map((cp) => `p-${cp} n${cp}`).join(" ")
      : "";
  const edgeClass = (node as { __edgeClass?: string }).__edgeClass;
  const dom: Record<string, any> = {
    className: `n${domNodeClass} p-${node.id}${isCarouselDotActive ? " p-carouselDotActive" : ""}${isSlideClass}${counterpartClasses}${edgeClass ? ` ${edgeClass}` : ""}${customClass}`,
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
      const perView =
        ctxCarousel?.perView ??
        (Number(
          content?._design?.carouselSlidesPerView ??
            ctx.selfData?._design?.carouselSlidesPerView ??
            ctx.selfData?.carouselSlidesPerView ??
            (node.props as Record<string, unknown>)?.carouselSlidesPerView ??
            (node.props as Record<string, unknown>)?.slidesPerView ??
            (node.props as Record<string, unknown>)?.perView,
        ) ||
          1.25);

      const gapPx = 12;
      const slideWidthCss =
        perView === 1
          ? "100%"
          : `calc((100% - ${(perView - 1) * gapPx}px) / ${perView})`;

      const trackId = `ts-track-${node.id}`;

      const rawChildren = node.children ?? [];
      const hasRepeatChild = rawChildren.some(
        (c) => c.kind === "element" && Boolean((c as any).repeat),
      );
      const isStaticLoop =
        !hasRepeatChild &&
        Boolean(ctxCarousel?.loop) &&
        rawChildren.length >= 2;

      const childrenToRender = isStaticLoop
        ? [
            ...rawChildren.map((c) => ({ child: c, keyPrefix: "clone-prev" })),
            ...rawChildren.map((c) => ({ child: c, keyPrefix: "real" })),
            ...rawChildren.map((c) => ({ child: c, keyPrefix: "clone-next" })),
          ]
        : rawChildren.map((c) => ({ child: c, keyPrefix: "" }));

      const kids = childrenToRender.map(({ child, keyPrefix }) => (
        <NodeRenderer
          key={keyPrefix ? `${keyPrefix}-${child.id}` : child.id}
          node={child}
          content={content}
          ctx={{ ...ctx, isCarouselSlide: true, carouselPerView: perView }}
        />
      ));

      return (
        <React.Fragment>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .${trackId}-viewport {
              overflow: hidden !important;
              width: 100% !important;
              position: relative !important;
              touch-action: pan-y !important;
              user-select: none !important;
              -webkit-user-select: none !important;
              cursor: grab !important;
            }
            .${trackId}-viewport:active {
              cursor: grabbing !important;
            }
            .${trackId}-track {
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              gap: ${gapPx}px !important;
              column-gap: ${gapPx}px !important;
              row-gap: 0px !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              box-sizing: border-box !important;
              will-change: transform !important;
            }
            .${trackId}-track > * {
              flex: 0 0 ${slideWidthCss} !important;
              min-width: ${slideWidthCss} !important;
              max-width: ${slideWidthCss} !important;
              width: ${slideWidthCss} !important;
              box-sizing: border-box !important;
              user-select: none !important;
              -webkit-user-select: none !important;
            }
            .${trackId}-track img {
              -webkit-user-drag: none !important;
              user-select: none !important;
              pointer-events: none !important;
            }
          `,
            }}
          />
          <div
            {...dom}
            {...ctxCarousel?.dragProps}
            ref={ctxCarousel?.viewportRef}
            className={`${dom.className} ${trackId}-viewport`}
            style={{
              ...dom.style,
              overflow: "hidden",
              width: "100%",
              position: "relative",
              touchAction: "pan-y",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: "grab",
            }}
          >
            <div
              ref={ctxCarousel?.trackRef}
              className={`${trackId}-track`}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: `${gapPx}px`,
                columnGap: `${gapPx}px`,
                width: "100%",
                boxSizing: "border-box",
                willChange: "transform",
              }}
            >
              {kids}
            </div>
          </div>
        </React.Fragment>
      );
    }
    case "image": {
      // Priority: user's custom bound image -> template's default image (props.src) -> empty
      const src = (!isEmpty(bound) ? bound : undefined) ?? props.src ?? "";
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
      if (isBound) {
        if (!isEmpty(resolvedText)) {
          // Prefix/suffix (e.g. "at " before a company name) render only
          // around a real value, so an empty field never leaves "at" behind.
          const prefix = typeof props.prefix === "string" ? props.prefix : "";
          const suffix = typeof props.suffix === "string" ? props.suffix : "";
          children =
            prefix || suffix ? (
              <>
                {prefix && <span className="ts-prefix">{prefix}</span>}
                {resolvedText}
                {suffix && <span className="ts-suffix">{suffix}</span>}
              </>
            ) : (
              resolvedText
            );
        } else if (isCardBound && ctx.card) {
          children = "";
        } else if (ctx.selfData !== undefined || content !== undefined) {
          children = "";
        } else {
          children = props.text ?? "";
        }
      } else {
        children = !isEmpty(resolvedText) ? resolvedText : (props.text ?? "");
      }
      break;
    }
    case "richtext": {
      const rawHtml =
        bound ?? (isCardBound && ctx.card ? "" : (props.html ?? ""));
      dom.dangerouslySetInnerHTML = {
        __html: sanitizeHtml(String(rawHtml), "richtext"),
      };
      break;
    }
    case "embed": {
      const rawHtml =
        bound ?? (isCardBound && ctx.card ? "" : (props.html ?? ""));
      dom.dangerouslySetInnerHTML = {
        __html: sanitizeHtml(String(rawHtml), "embed"),
      };
      break;
    }
    case "video": {
      const url = String(
        bound ?? (isCardBound && ctx.card ? undefined : props.url) ?? "",
      );
      const thumbnail = String(
        ctx.selfData?.thumbnail ?? content?.thumbnail ?? "",
      );
      // Layers inside the player are a click-to-play cover (thumbnail, play
      // button…). The real player only loads once the visitor taps it.
      if (node.children?.length) {
        return (
          <VideoFacade
            tag={tag}
            dom={dom}
            node={node}
            content={content}
            ctx={ctx}
            url={url}
            thumbnail={thumbnail}
            props={props}
          />
        );
      }
      if (!url) break;
      children = videoPlayer(url, thumbnail, props, false);
      break;
    }
    case "button":
    case "link":
    case "frame": {
      if (node.tag === "frame" && props.as !== "a") break;
      const action = (props.action as string) || "link";
      dom["data-action"] = action;

      if (
        action === "carousel-prev" &&
        ctxCarousel &&
        !ctxCarousel.canScrollPrev
      ) {
        dom.style = { ...dom.style, opacity: 0.35, cursor: "not-allowed" };
      }
      if (
        action === "carousel-next" &&
        ctxCarousel &&
        !ctxCarousel.canScrollNext
      ) {
        dom.style = { ...dom.style, opacity: 0.35, cursor: "not-allowed" };
      }

      const interceptClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (action === "carousel-prev") {
          ctxCarousel?.scrollPrev?.();
          return;
        }

        if (action === "carousel-next") {
          ctxCarousel?.scrollNext?.();
          return;
        }

        if (action === "carousel-dot") {
          const target = ctx.repeatIndex ?? 0;
          ctxCarousel?.scrollTo?.(target);
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
        if (node.tag === "link" || node.tag === "frame") {
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
      if (
        (node.tag === "link" || node.tag === "frame") &&
        props.target === "_blank"
      ) {
        dom.target = "_blank";
        dom.rel = "noopener noreferrer";
      }
      if (node.tag !== "frame") {
        children = props.label ?? boundLabel;
      }
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
        <React.Fragment key={child.id}>
          {!ctx.isEditing &&
            ctx.placeholderId &&
            ctx.injectBefore &&
            child.id === ctx.placeholderId &&
            ctx.renderUserBlocks &&
            ctx.renderUserBlocks()}
          <NodeRenderer
            key={child.id}
            node={child}
            content={content}
            ctx={{ ...ctx, isCarouselSlide: false }}
          />
        </React.Fragment>
      ))}
      {node.id === ctx.rootId &&
        !ctx.placeholderId &&
        ctx.renderUserBlocks &&
        ctx.renderUserBlocks()}
    </>,
  );
}

// ─── Video ───────────────────────────────────────────────────────────────────

type VideoSource =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "file" };

function parseVideoUrl(url: string): VideoSource {
  if (
    url.includes("youtube.com") ||
    url.includes("youtube-nocookie.com") ||
    url.includes("youtu.be/")
  ) {
    let id = "";
    try {
      const parsed = new URL(url);
      id =
        parsed.searchParams.get("v") ||
        parsed.pathname.split("/").filter(Boolean).pop() ||
        "";
    } catch {
      id = url.split("/").pop() || "";
    }
    return { kind: "youtube", id };
  }
  if (url.includes("vimeo.com/")) {
    return { kind: "vimeo", id: url.split("/").filter(Boolean).pop() || "" };
  }
  return { kind: "file" };
}

/** YouTube's own thumbnail for a video URL, or "" for anything else. */
export function videoThumbnailUrl(url: string): string {
  const v = parseVideoUrl(url);
  return v.kind === "youtube" && v.id
    ? `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg`
    : "";
}

/** The real player. `start` = the visitor already tapped play. */
function videoPlayer(
  url: string,
  thumbnail: string,
  props: Record<string, any>,
  start: boolean,
): React.ReactNode {
  const v = parseVideoUrl(url);
  const fill = { width: "100%", height: "100%", border: 0 };
  if (v.kind === "youtube") {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}${start ? "?autoplay=1&rel=0" : ""}`}
        style={fill}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  if (v.kind === "vimeo") {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${encodeURIComponent(v.id)}${start ? "?autoplay=1" : ""}`}
        style={fill}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  return (
    <video
      src={url}
      poster={thumbnail || undefined}
      controls={start || props.controls}
      autoPlay={start || props.autoplay}
      loop={props.loop}
      playsInline
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

/**
 * A `video` node with child layers: those layers are the cover, designed in
 * the builder like anything else. Tapping it swaps in the real player (with
 * autoplay), so a card with videos doesn't load YouTube until it's wanted.
 * Children binding `self.thumbnail` get YouTube's thumbnail when none is set.
 */
function VideoFacade({
  tag,
  dom,
  node,
  content,
  ctx,
  url,
  thumbnail,
  props,
}: {
  tag: string;
  dom: Record<string, any>;
  node: ElementNode;
  content: any;
  ctx: RenderCtx;
  url: string;
  thumbnail: string;
  props: Record<string, any>;
}) {
  const [playing, setPlaying] = React.useState(false);

  if (playing && url && !ctx.isEditing) {
    return React.createElement(tag, dom, videoPlayer(url, thumbnail, props, true));
  }

  const thumb = thumbnail || videoThumbnailUrl(url);
  const coverContent =
    content && typeof content === "object" ? { ...content, thumbnail: thumb } : { thumbnail: thumb };
  const coverSelf =
    ctx.selfData && typeof ctx.selfData === "object"
      ? { ...ctx.selfData, thumbnail: thumb }
      : ctx.selfData;
  const canPlay = Boolean(url) && !ctx.isEditing;
  const play = () => setPlaying(true);

  return React.createElement(
    tag,
    canPlay
      ? {
          ...dom,
          role: "button",
          tabIndex: 0,
          "aria-label": "Play video",
          style: { ...dom.style, cursor: "pointer" },
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            play();
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              play();
            }
          },
        }
      : dom,
    node.children!.map((child) => (
      <NodeRenderer
        key={child.id}
        node={child}
        content={coverContent}
        ctx={{ ...ctx, selfData: coverSelf, isCarouselSlide: false }}
      />
    )),
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

export function mergeLayoutTrees(
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

  const structural =
    instance.id === defaultLayout.id ? structuralFrom(defaultLayout) : {};
  // "Hide when empty" IS edited in the builder: an explicit stored value
  // (true or false) is the admin's choice and must win over the default —
  // otherwise turning it off on Profile's cover never took effect.
  if (instance.hideIfEmpty !== undefined) delete structural.hideIfEmpty;

  const merged: ElementNode = {
    ...instance,
    // Same id ⇒ same node; a different id (e.g. the admin wrapped the layout
    // in a new frame) is the admin's own structure and is left alone.
    ...structural,
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

    if (defaultLayout.children && defaultLayout.children.length > 0) {
      const existingIds = new Set(merged.children.map((c) => c.id));
      for (let i = 0; i < defaultLayout.children.length; i++) {
        const defChild = defaultLayout.children[i];
        if (defChild.id && !existingIds.has(defChild.id)) {
          if (
            defChild.id === "itemIndex" ||
            defChild.id === "c_itemIndex" ||
            defChild.id === "index" ||
            defChild.id === "serial"
          ) {
            const targetPos = Math.min(i, merged.children.length);
            merged.children.splice(targetPos, 0, structuredClone(defChild));
            existingIds.add(defChild.id);
          }
        }
      }
    }
  } else if (
    merged.children === undefined &&
    defaultLayout.children &&
    defaultLayout.children.length > 0
  ) {
    // Only fill children the instance never had. An explicit `[]` means the
    // admin deleted them — refilling made the last child undeletable.
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
  const wType = (node.widget || "").toUpperCase();

  // Resolve content for this widget from direct keys, IDs, or selfData (custom blocks)
  let rawWidgetContent =
    (node.key ? content?.[node.key] : undefined) ??
    (node.id ? content?.[node.id] : undefined) ??
    (node.key ? ctx.selfData?.[node.key] : undefined) ??
    (node.id ? ctx.selfData?.[node.id] : undefined);

  // If inside a block/group and not matched directly, infer by widget type conventions
  if (rawWidgetContent === undefined && ctx.selfData) {
    if (wType === "TITLE" || wType === "HEADING") {
      rawWidgetContent =
        ctx.selfData.title ??
        ctx.selfData.title_1 ??
        ctx.selfData.heading ??
        ctx.selfData.heading_1;
    } else if (wType === "DESCRIPTION" || wType === "RICH_TEXT") {
      rawWidgetContent =
        ctx.selfData.description ??
        ctx.selfData.description_1 ??
        ctx.selfData.text ??
        ctx.selfData.text_1;
    } else if (wType === "VIDEO") {
      rawWidgetContent =
        ctx.selfData.videoUrl ?? ctx.selfData.videoUrl_1 ?? ctx.selfData.url;
    } else if (wType === "IMAGE") {
      rawWidgetContent =
        ctx.selfData.imageUrl ?? ctx.selfData.imageUrl_1 ?? ctx.selfData.src;
    }
  }

  // Normalize into standard widget data structure
  let widgetContent: Record<string, any>;
  if (
    typeof rawWidgetContent === "string" ||
    typeof rawWidgetContent === "number"
  ) {
    if (
      wType === "TITLE" ||
      wType === "HEADING" ||
      wType === "DESCRIPTION" ||
      wType === "RICH_TEXT"
    ) {
      widgetContent = {
        ...(node.defaultContent ?? {}),
        text: String(rawWidgetContent),
      };
    } else if (wType === "VIDEO") {
      widgetContent = {
        ...(node.defaultContent ?? {}),
        url: String(rawWidgetContent),
      };
    } else if (wType === "IMAGE") {
      widgetContent = {
        ...(node.defaultContent ?? {}),
        src: String(rawWidgetContent),
      };
    } else {
      widgetContent = {
        ...(node.defaultContent ?? {}),
        text: String(rawWidgetContent),
        value: String(rawWidgetContent),
      };
    }
  } else if (rawWidgetContent && typeof rawWidgetContent === "object") {
    widgetContent = { ...(node.defaultContent ?? {}), ...rawWidgetContent };
  } else {
    widgetContent =
      (node.key ? content?.[node.key] : undefined) ?? node.defaultContent ?? {};
  }

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
      node.widget ? blockClass(node.widget) : "",
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
        ...(node.key ? { "data-widget-key": node.key } : {}),
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

    // "Inject before" placeholders are handled by the parent element's child
    // loop; doing it here too rendered every user block twice.
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
      data-widget-key={node.key || undefined}
    >
      <Widget
        content={widgetContent}
        design={design}
        cls={cls}
        ctx={widgetCtx}
      />
    </div>
  );

  // "Inject before" is handled by the parent element's child loop.
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
