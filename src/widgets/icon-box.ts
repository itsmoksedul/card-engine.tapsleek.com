import type { WidgetModule } from "../types/widget";

export const meta: WidgetModule["meta"] = {
  type: "ICON_BOX",
  label: "Icon Box",
  iconName: "BadgeInfo",
  group: "content",
  description: "An icon with a title and short description.",
  contentVersion: 1,
  contentSchema: [
    { key: "icon", type: "icon", label: "Icon", set: "lucide" },
    { key: "title", type: "text", label: "Title", required: true, max: 60 },
    { key: "description", type: "textarea", label: "Description", max: 200 },
    { key: "link", type: "url", label: "Link" },
  ],
  defaultDesign: {},
  defaultContent: {
    icon: "Zap",
    title: "Fast",
    description: "A short supporting line.",
    link: "",
  },
  defaultLayout: {
    id: "root",
    kind: "element",
    tag: "link",
    bind: { source: "self", path: "link" },
    props: { action: "link" },
    style: {
      base: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "{space.2}",
        padding: {
          t: "{space.4}",
          r: "{space.4}",
          b: "{space.4}",
          l: "{space.4}",
        },
        background: { kind: "color", color: "{color.surface}" },
        borderRadius: { all: "{radius.lg}" },
      },
    },
    children: [
      {
        id: "icon",
        kind: "element",
        tag: "icon",
        bind: { source: "self", path: "icon" },
        hideIfEmpty: true,
        style: {
          base: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "{size.xl}",
            color: "{color.primary}",
          },
        },
      },
      {
        id: "title",
        kind: "element",
        tag: "heading",
        props: { level: 3 },
        bind: { source: "self", path: "title" },
        style: {
          base: {
            fontFamily: "{font.heading}",
            fontSize: "{size.lg}",
            fontWeight: 600,
            color: "{color.text}",
          },
        },
      },
      {
        id: "description",
        kind: "element",
        tag: "text",
        bind: { source: "self", path: "description" },
        hideIfEmpty: true,
        style: {
          base: {
            fontSize: "{size.sm}",
            color: "{color.muted}",
            textAlign: "center",
          },
        },
      },
    ],
  },
};

export const previews = {
  empty: { icon: "", title: "", description: "" },
  typical: meta.defaultContent,
  stress: {
    icon: "Zap",
    title: "A".repeat(60),
    description: "B".repeat(200),
    link: "",
  },
};
