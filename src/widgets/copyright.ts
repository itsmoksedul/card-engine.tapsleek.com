import type { WidgetModule } from "../types/widget";

export const meta: WidgetModule["meta"] = {
  type: "COPYRIGHT",
  label: "Copyright",
  iconName: "Type",
  group: "system",
  description: "Footer copyright text.",
  contentVersion: 1,
  contentSchema: [
    {
      key: "text",
      type: "text",
      label: "Copyright text",
      default: "© 2026 TapSleek. All rights reserved.",
    },
  ],
  defaultDesign: {},
  defaultContent: {
    text: "© 2026 TapSleek. All rights reserved.",
  },
  defaultLayout: {
    id: "copyright-root",
    kind: "element",
    tag: "stack",
    style: {
      base: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: {
          t: "{space.4}",
          r: "{space.2}",
          b: "{space.4}",
          l: "{space.2}",
        },
        width: "100%",
      },
    },
    children: [
      {
        id: "text",
        kind: "element",
        tag: "text",
        bind: { source: "self", path: "text" },
        style: {
          base: {
            fontSize: "{size.xs}",
            color: "{color.muted}",
            textAlign: "center",
          },
        },
      },
    ],
  },
};

export const previews = {
  empty: {},
  typical: {},
  stress: {},
};
