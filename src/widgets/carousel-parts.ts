import type { WidgetModule, WidgetPart } from "../types/widget";

export const carouselParts: WidgetPart[] = [
  {
    key: "carouselRoot",
    label: "Carousel Container",
    kind: "container",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselTrack",
    label: "Carousel Track",
    kind: "container",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselArrowPrev",
    label: "Prev Arrow",
    kind: "button",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselArrowNext",
    label: "Next Arrow",
    kind: "button",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselArrowIcon",
    label: "Arrow Icon",
    kind: "icon",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselDots",
    label: "Dots Container",
    kind: "container",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselDot",
    label: "Dot (Inactive)",
    kind: "button",
    visibleIf: { key: "useCarousel", equals: true },
  },
  {
    key: "carouselDotActive",
    label: "Dot (Active)",
    kind: "button",
    visibleIf: { key: "useCarousel", equals: true },
  },
];

export function getCarouselDesignSchema(dotsKey = "showDots"): any[] {
  return [
    { key: "showArrows", type: "boolean", label: "Show Arrows", visibleIf: { key: "useCarousel", equals: true } },
    { key: dotsKey, type: "boolean", label: "Show Pagination", visibleIf: { key: "useCarousel", equals: true } },
    {
      key: "carouselSlidesPerView",
      type: "select",
      label: "Slides Per View",
      visibleIf: { key: "useCarousel", equals: true },
      options: [
        { value: "1.25", label: "1 (with peek)" },
        { value: "2.25", label: "2 (with peek)" },
        { value: "1", label: "1 (Full)" },
        { value: "2", label: "2 (Full)" },
        { value: "3", label: "3 (Full)" },
      ],
    },
    {
      key: "carouselAlign",
      type: "select",
      label: "Alignment",
      visibleIf: { key: "useCarousel", equals: true },
      options: [
        { value: "start", label: "Start" },
        { value: "center", label: "Center" },
        { value: "end", label: "End" },
      ],
    },
    {
      key: "carouselLoop",
      type: "boolean",
      label: "Infinite Loop",
      visibleIf: { key: "useCarousel", equals: true },
    },
    {
      key: "carouselAutoplay",
      type: "boolean",
      label: "Autoplay",
      visibleIf: { key: "useCarousel", equals: true },
    },
    {
      key: "carouselAutoplayDelay",
      type: "select",
      label: "Autoplay Speed",
      visibleIf: { key: "carouselAutoplay", equals: true },
      options: [
        { value: "2000", label: "2 Seconds" },
        { value: "3000", label: "3 Seconds" },
        { value: "5000", label: "5 Seconds" },
        { value: "7000", label: "7 Seconds" },
      ],
    },
  ];
}

export const carouselDefaultPartStyles: WidgetModule["meta"]["defaultPartStyles"] =
  {
    carouselRoot: {
      base: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "{space.4}",
      },
    },
    carouselTrack: {
      base: {
        display: "flex",
        overflowX: "auto",
        gap: "{space.3}",
        padding: { b: "{space.2}" },
        /* Hide scrollbar by default in native CSS */
      },
    },
    carouselArrowPrev: {
      base: {
        display: "none", // Admin can toggle display to flex if they want arrows
        position: "absolute",
        left: "{space.2}",
        top: "50%",
        transform: { translateY: "-50%" },
        zIndex: 10,
        width: "32px",
        height: "32px",
        alignItems: "center",
        justifyContent: "center",
        background: { kind: "color", color: "{color.surface}" },
        borderRadius: { all: "50%" },
        border: { style: "solid", width: "1px", color: "{color.border}" },
        boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" },
        cursor: "pointer",
      },
    },
    carouselArrowNext: {
      base: {
        display: "none",
        position: "absolute",
        right: "{space.2}",
        top: "50%",
        transform: { translateY: "-50%" },
        zIndex: 10,
        width: "32px",
        height: "32px",
        alignItems: "center",
        justifyContent: "center",
        background: { kind: "color", color: "{color.surface}" },
        borderRadius: { all: "50%" },
        border: { style: "solid", width: "1px", color: "{color.border}" },
        boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" },
        cursor: "pointer",
      },
    },
    carouselArrowIcon: {
      base: {
        width: "16px",
        height: "16px",
        color: "{color.text}",
      },
    },
    carouselDots: {
      base: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "{space.2}",
        margin: { t: "{space.2}" },
      },
    },
    carouselDot: {
      base: {
        width: "8px",
        height: "8px",
        borderRadius: { all: "50%" },
        background: { kind: "color", color: "{color.border}" },
        cursor: "pointer",
        padding: { all: "0" },
      },
    },
    carouselDotActive: {
      base: {
        width: "8px",
        height: "8px",
        borderRadius: { all: "50%" },
        background: { kind: "color", color: "{color.primary}" },
        cursor: "pointer",
        padding: { all: "0" },
      },
    },
  };

export function createCarouselLayout(
  itemNode: any,
  options?: {
    itemsPath?: string;
    dotsKey?: string;
  }
): any {
  const itemsPath = options?.itemsPath ?? "items";
  const dotsKey = options?.dotsKey ?? "showDots";

  return {
    id: "carouselRoot",
    kind: "element",
    tag: "carousel-root",
    name: "Carousel Container",
    visibleIf: { key: "useCarousel", equals: true },
    style: {
      base: { position: "relative", display: "flex", flexDirection: "column", gap: "{space.4}" },
    },
    children: [
      {
        id: "carouselTrack",
        kind: "element",
        tag: "carousel",
        name: "Carousel Track",
        style: {
          base: { display: "flex", gap: "{space.3}", padding: { b: "{space.2}" } }
        },
        children: [
          {
            ...itemNode,
            id: itemNode.id || "carouselItem",
            repeat: { source: "self", path: itemsPath },
            style: {
              ...itemNode.style,
              base: {
                ...(itemNode.style?.base || {}),
                flexGrow: 0,
                flexShrink: 0,
                flexBasis: "auto",
                minWidth: "80%",
              },
            },
          },
        ],
      },
      {
        id: "carouselControls",
        kind: "element",
        tag: "frame",
        name: "Controls",
        style: {
          base: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            margin: { t: "{space.4}" },
          },
        },
        children: [
          {
            id: "carouselArrows",
            kind: "element",
            tag: "stack",
            name: "Arrows",
            visibleIf: { key: "showArrows", equals: true },
            style: {
              base: { display: "flex", flexDirection: "row", gap: "{space.2}" },
            },
            children: [
              {
                id: "arrowPrev",
                kind: "element",
                tag: "button",
                name: "Prev Arrow",
                props: { action: "carousel-prev" },
                style: {
                  base: {
                    width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" },
                    border: { style: "solid", width: "1px", color: "{color.border}" },
                    boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer",
                  },
                },
                children: [
                  { id: "iconPrev", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronLeft" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }
                ]
              },
              {
                id: "arrowNext",
                kind: "element",
                tag: "button",
                name: "Next Arrow",
                props: { action: "carousel-next" },
                style: {
                  base: {
                    width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: { kind: "color", color: "{color.surface}" }, borderRadius: { all: "50%" },
                    border: { style: "solid", width: "1px", color: "{color.border}" },
                    boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" }, cursor: "pointer",
                  },
                },
                children: [
                  { id: "iconNext", kind: "element", tag: "icon", name: "Icon", props: { name: "ChevronRight" }, style: { base: { width: "16px", height: "16px", color: "{color.text}" } } }
                ]
              }
            ]
          },
          {
            id: "carouselDots",
            kind: "element",
            tag: "stack",
            name: "Pagination",
            visibleIf: { key: dotsKey, equals: true },
            style: {
              base: { display: "flex", flexDirection: "row", alignItems: "center", gap: "{space.2}" },
            },
            children: [
              {
                id: "carouselDot",
                kind: "element",
                tag: "button",
                name: "Dot",
                props: { action: "carousel-dot" },
                repeat: { source: "self", path: itemsPath },
                style: {
                  base: {
                    width: "8px", height: "8px", borderRadius: { all: "50%" }, cursor: "pointer",
                    background: { kind: "color", color: "{color.border}" },
                    border: { style: "none" }, padding: { all: "0" },
                    transition: { property: ["width", "background-color"], duration: 200, easing: "ease" },
                  },
                  hover: { background: { kind: "color", color: "{color.primary}" } },
                },
                activeStyle: {
                  base: {
                    width: "20px",
                    background: { kind: "color", color: "{color.primary}" },
                  },
                },
              }
            ]
          }
        ]
      }
    ],
  };
}
