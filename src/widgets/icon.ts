import type { WidgetModule } from "../types/widget";

export const meta: WidgetModule["meta"] = {
  type: "ICON",
  label: "Icon",
  iconName: "Smile",
  group: "utility",
  description: "A single icon, optionally linked.",
  contentVersion: 1,
  contentSchema: [
    { key: "icon", type: "icon", label: "Icon", set: "lucide" },
    { key: "link", type: "url", label: "Link" },
  ],
  defaultDesign: { align: "center" },
  defaultContent: { icon: "Star", link: "" },
  defaultLayout: {
    id: "root",
    kind: "element",
    tag: "icon",
    bind: { source: "self", path: "icon" },
    style: {
      base: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "{size.2xl}",
        color: "{color.primary}",
      },
    },
  },
};

export const previews = {
  empty: { icon: "" },
  typical: meta.defaultContent,
  stress: { icon: "Star", link: "https://example.com/" + "x".repeat(180) },
};
