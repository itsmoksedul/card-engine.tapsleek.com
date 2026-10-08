import type { WidgetModule } from "../types/widget";

export const meta: WidgetModule["meta"] = {
  type: "TIMELINE",
  label: "Timeline",
  iconName: "ListOrdered",
  group: "business",
  description: "A vertical timeline of events, history, or steps.",
  contentVersion: 1,
  defaultLayout: {
    id: "timeline-root",
    kind: "element",
    tag: "stack",
    style: {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "{space.4}",
        padding: { all: "{space.4}" },
        background: { kind: "color", color: "{color.surface}" },
        borderRadius: { all: "{radius.lg}" },
      },
    },
    children: [
      {
        id: "heading",
        kind: "element",
        tag: "heading",
        props: { level: 3 },
        hideIfEmpty: true,
        bind: { source: "self", path: "heading" },
        style: {
          base: {
            fontFamily: "{font.heading}",
            fontSize: "{size.lg}",
            fontWeight: 700,
            color: "{color.text}",
          },
        },
      },
      {
        id: "list",
        kind: "element",
        tag: "stack",
        style: {
          base: { display: "flex", flexDirection: "column" },
        },
        children: [
          {
            id: "item",
            kind: "element",
            tag: "stack",
            repeat: { source: "self", path: "items" },
            style: {
              base: {
                display: "flex",
                position: "relative",
                padding: { b: "{space.4}" },
              },
            },
            children: [
              {
                id: "bullet",
                kind: "element",
                tag: "stack",
                style: {
                  base: {
                    width: "12px",
                    height: "12px",
                    margin: { t: "4px" },
                    borderRadius: { all: "{radius.full}" },
                    background: { kind: "color", color: "{color.primary}" },
                    zIndex: 2,
                  },
                },
              },
              {
                id: "line",
                kind: "element",
                tag: "stack",
                style: {
                  base: {
                    position: "absolute",
                    left: "5px",
                    top: "16px",
                    bottom: 0,
                    width: "2px",
                    background: { kind: "color", color: "{color.border}" },
                    zIndex: 1,
                  },
                },
              },
              {
                id: "content",
                kind: "element",
                tag: "stack",
                style: {
                  base: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "{space.1}",
                    padding: { l: "{space.4}" },
                  },
                },
                children: [
                  {
                    id: "date",
                    kind: "element",
                    tag: "text",
                    bind: { source: "self", path: "date" },
                    style: {
                      base: {
                        fontSize: "{size.xs}",
                        fontWeight: 600,
                        color: "{color.primary}",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      },
                    },
                  },
                  {
                    id: "title",
                    kind: "element",
                    tag: "heading",
                    props: { level: 4 },
                    bind: { source: "self", path: "title" },
                    style: {
                      base: {
                        fontSize: "{size.base}",
                        fontWeight: 600,
                        color: "{color.text}",
                      },
                    },
                  },
                  {
                    id: "description",
                    kind: "element",
                    tag: "text",
                    hideIfEmpty: true,
                    bind: { source: "self", path: "description" },
                    style: {
                      base: {
                        fontSize: "{size.sm}",
                        color: "{color.muted}",
                        lineHeight: 1.5,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  designSchema: [
    {
      key: "bulletStyle",
      type: "select",
      label: "Bullet Style",
      options: [
        { value: "dot", label: "Solid Dot" },
        { value: "circle", label: "Hollow Circle" },
      ],
    },
  ],
  contentSchema: [
    { key: "heading", type: "text", label: "Heading", max: 60 },
    {
      key: "items",
      type: "repeater",
      label: "Timeline Events",
      itemLabel: "{title}",
      fields: [
        {
          key: "date",
          type: "text",
          label: "Date / Step (e.g. 2024)",
          max: 40,
        },
        { key: "title", type: "text", label: "Title", max: 80 },
        { key: "description", type: "text", label: "Description", max: 200 },
      ],
    },
  ],
  defaultDesign: { bulletStyle: "dot" },
  defaultContent: {
    heading: "Our Journey",
    items: [
      {
        date: "2022",
        title: "Company Founded",
        description: "Started in a small garage.",
      },
      {
        date: "2023",
        title: "First Product Launch",
        description: "Launched v1 to the public.",
      },
      {
        date: "2024",
        title: "Global Expansion",
        description: "Opened offices in 3 new countries.",
      },
    ],
  },
};

export const previews = {
  empty: { heading: "", items: [] },
  typical: meta.defaultContent,
  stress: {
    heading: "A".repeat(60),
    items: Array(5).fill({
      date: "A".repeat(40),
      title: "A".repeat(80),
      description: "A".repeat(200),
    }),
  },
};
