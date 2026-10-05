// @ts-nocheck
/**
 * Engine test suite.
 *
 * Two halves:
 *   • targeted tests for the compiler, validator and migration logic
 *   • a GENERIC widget suite that loops the registry, so every widget added
 *     from now on arrives with coverage for free (Appendix D.9 of the spec)
 */

declare var describe: any;
declare var it: any;
declare var expect: any;
import {
  blockClass,
  resolveBlockDesign,
  userBlockTypes,
} from "./blocks/resolve-design";
import {
  buildArtifact,
  definitionFingerprint,
  stableStringify,
} from "./compile/artifact";
import {
  compileCardTheme,
  compileCss,
  compileTokenOverrides,
} from "./compile/compile-css";
import { declarationsFor } from "./compile/declarations";
import { safeUrl, utf8Bytes } from "./compile/value";
import {
  migrateCardContent,
  migrateWidgetContent,
  VERSION_KEY,
} from "./content/migrate";
import {
  seedContentFromTemplate,
  switchTemplateContent,
  widgetTypeMap,
} from "./content/template-switch";
import { resolveBinding } from "./render/resolveBinding";
import { blankDefinition, type TemplateDefinition } from "./types/definition";
import { defaultsFor, walkFields } from "./types/field";
import type { ElementNode, WidgetNode } from "./types/node";
import { validateDefinition } from "./validate/definition";
import { validateAgainstSchema } from "./validate/schema-to-zod";
import { manifest, partKeys, WIDGET_TYPES } from "./widgets/registry";
import { renderToStaticMarkup } from "react-dom/server";
import { NodeRenderer } from "./render/NodeRenderer";
import React from "react";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function serviceWidget(over: Partial<WidgetNode> = {}): WidgetNode {
  return {
    kind: "widget",
    id: "svc",
    widget: "SERVICE_LIST",
    key: "services_main",
    role: "services",
    label: "Our Services",
    design: {
      layout: "grid-2",
      showMedia: true,
      showDesc: true,
      mediaRatio: "4/3",
    },
    userOptions: ["layout"],
    userCanHide: true,
    defaultContent: {
      title: "Our Services",
      description: "",
      items: [{ name: "Design" }],
    },
    style: {
      base: { display: "flex", flexDirection: "column", gap: "{space.3}" },
    },
    partStyles: {
      item: {
        base: {
          background: { kind: "color", color: "{color.surface}" },
          borderRadius: { all: "{radius.md}" },
          padding: { all: "{space.3}" },
        },
        hover: { transform: { translateY: "-2px" }, boxShadow: "{shadow.md}" },
      },
      list: {
        base: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "{space.3}",
        },
      },
    },
    ...over,
  } as WidgetNode;
}

function fixture(): TemplateDefinition {
  const def = blankDefinition("Test Template");
  const header: ElementNode = {
    kind: "element",
    id: "hdr",
    tag: "stack",
    style: {
      base: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "{space.2}",
      },
      md: { flexDirection: "row" },
    },
    children: [
      {
        kind: "element",
        id: "av",
        tag: "image",
        bind: { source: "card", field: "profileImage" },
        props: { alt: "" },
        style: {
          base: {
            width: "96px",
            height: "96px",
            borderRadius: { all: "{radius.full}" },
          },
        },
      },
      {
        kind: "element",
        id: "nm",
        tag: "heading",
        props: { level: 1 },
        bind: { source: "card", field: "fullName" },
        style: {
          base: {
            fontSize: "{size.2xl}",
            fontWeight: 700,
            color: "{color.text}",
          },
        },
      },
      {
        kind: "element",
        id: "jt",
        tag: "text",
        bind: { source: "card", field: "jobTitle" },
        hideIfEmpty: true,
        style: { base: { fontSize: "{size.sm}", color: "{color.muted}" } },
      },
    ],
  };
  def.root.children = [header, serviceWidget()];
  return def;
}

// ─── Compiler ────────────────────────────────────────────────────────────────

describe("compileCss", () => {
  it("emits cascade layers, tokens and the card frame", () => {
    const { css } = compileCss(fixture());
    expect(css).toContain("@layer ts-reset, ts-template, ts-override;");
    expect(css).toContain("--c-primary:#3B5BFE");
    expect(css).toContain("--sp-4:16px");
    expect(css).toContain("max-width:450px");
  });

  it("resolves token refs to CSS variables, never to literals", () => {
    const { css } = compileCss(fixture());
    expect(css).toContain("var(--r-full)");
    expect(css).toContain("var(--c-muted)");
    // the literal must appear only in the token table, not at a use site
    expect(css.match(/#6B7280/g)?.length).toBe(1);
  });

  it("scopes every rule to the card wrapper", () => {
    const { css } = compileCss(fixture());
    const selectors = css.match(/(^|[{}])\s*([^{}@]+)\{/g) ?? [];
    const leaked = selectors.filter(
      (s) => !s.includes(".ts-card") && !s.includes("@") && !s.includes("--"),
    );
    expect(leaked).toEqual([]);
  });

  it("puts breakpoint overrides in a desktop-first max-width media query", () => {
    const { css } = compileCss(fixture());
    expect(css).toContain("@media (max-width:768px)");
    // The desktop base (column) precedes the Tablet override (row).
    expect(css.indexOf("flex-direction:column")).toBeLessThan(
      css.indexOf("@media (max-width:768px)"),
    );
    const md = css.slice(css.indexOf("@media (max-width:768px)"));
    expect(md).toContain("flex-direction:row");
  });

  it("orders overrides Tablet-before-Mobile so the narrower one wins", () => {
    const def = fixture();
    (def.root.children![0] as ElementNode).style = {
      base: { gap: "{space.2}" },
      md: { gap: "{space.3}" },
      sm: { gap: "{space.4}" },
    };
    const { css } = compileCss(def);
    // Mobile (max-width:480px) must appear AFTER Tablet (max-width:768px).
    expect(css.indexOf("@media (max-width:480px)")).toBeGreaterThan(-1);
    expect(css.indexOf("@media (max-width:768px)")).toBeLessThan(
      css.indexOf("@media (max-width:480px)"),
    );
  });

  it("flattenTo collapses the cascade to one breakpoint, no media queries", () => {
    const def = fixture();
    // Only the header's rules: the fixture's SERVICE_LIST ships its own
    // (carousel) defaults that legitimately contain `row`.
    const hdr = (css: string) =>
      (css.match(/[^{}]*\.nhdr[^{}]*\{[^}]*\}/g) ?? []).join("");
    // Desktop only: no override at all.
    const desktop = compileCss(def, { flattenTo: "base" }).css;
    expect(desktop).not.toContain("@media");
    expect(hdr(desktop)).not.toContain("flex-direction:row");
    // Tablet preview: the md override is inlined, still no media query.
    const tablet = compileCss(def, { flattenTo: "md" }).css;
    expect(tablet).not.toContain("@media");
    expect(hdr(tablet)).toContain("flex-direction:row");
  });

  it("emits widget part styles and their hover state", () => {
    const { css } = compileCss(fixture());
    expect(css).toContain(".ts-card .nsvc .p-item");
    expect(css).toContain(".ts-card .nsvc .p-item:hover");
    expect(css).toContain("translate(0, -2px)");
  });

  it("merges rules with identical declaration bodies", () => {
    const def = fixture();
    const shared = { base: { display: "flex", gap: "{space.2}" } } as const;
    def.root.children!.push(
      { kind: "element", id: "a1", tag: "stack", style: shared, children: [] },
      { kind: "element", id: "a2", tag: "stack", style: shared, children: [] },
    );
    const { css } = compileCss(def);
    expect(css).toContain(".ts-card .na1,.ts-card .na2{");
  });

  it("is deterministic — same input, byte-identical output", () => {
    const a = compileCss(fixture()).css;
    const b = compileCss(fixture()).css;
    expect(a).toBe(b);
  });

  it("folds `hidden` into the right breakpoint", () => {
    const def = fixture();
    (def.root.children![0] as ElementNode).hidden = { md: true };
    const { css } = compileCss(def);
    const md = css.slice(css.indexOf("@media (max-width:768px)"));
    expect(md).toContain("display:none");
  });

  it("drops values it cannot emit rather than passing them through", () => {
    const def = fixture();
    (def.root.children![0] as ElementNode).style = {
      base: {
        color: "red; } body { display:none } .x {" as never,
        width: "expression(alert(1))" as never,
      },
    };
    const { css } = compileCss(def);
    expect(css).not.toContain("expression");
    // the injected rule must not survive in any form (the fixture's widget
    // defaults contain their own display:none, so look at this node only)
    expect(css).not.toMatch(/\.nhdr[^{]*\{[^}]*display:none/);
    expect(css).not.toContain("red;");
    expect(css).not.toMatch(/body\s*\{/);
    // the whole node produced nothing, so it has no rule at all
    expect(css).not.toContain(".nhdr{");
  });

  it("never emits a non-https background image", () => {
    const def = fixture();
    (def.root.children![0] as ElementNode).style = {
      base: { background: { kind: "image", url: "javascript:alert(1)" } },
    };
    expect(compileCss(def).css).not.toContain("javascript");
  });

  it("stays inside the size budget for a realistic template", () => {
    const def = fixture();
    for (let i = 0; i < 100; i++) {
      def.root.children!.push({
        kind: "element",
        id: `f${i}`,
        tag: "frame",
        style: {
          base: {
            padding: { all: "{space.3}" },
            background: { kind: "color", color: "{color.surface}" },
          },
        },
        children: [],
      });
    }
    const { bytes } = compileCss(def);
    expect(bytes).toBeLessThan(20_000);
  });
});

describe("compileTokenOverrides", () => {
  it("emits only allowed colour tokens, in the override layer", () => {
    const css = compileTokenOverrides(
      { color: { primary: "#E11D48", muted: "#000000" } },
      "ts-card-abc",
      ["primary"],
    );
    expect(css).toContain("@layer ts-override");
    expect(css).toContain("--c-primary:#E11D48");
    expect(css).not.toContain("--c-muted");
  });

  it("rejects an invalid colour", () => {
    expect(
      compileTokenOverrides({ color: { primary: "url(x)" } }, "ts-card-abc", [
        "primary",
      ]),
    ).toBe("");
  });

  it("is tiny", () => {
    const css = compileTokenOverrides(
      { color: { primary: "#E11D48" } },
      "ts-card-abc",
      ["primary"],
    );
    expect(utf8Bytes(css)).toBeLessThan(120);
  });
});

describe("buildArtifact", () => {
  it("produces an immutable, content-addressed key", () => {
    const a = buildArtifact({
      definition: fixture(),
      templateId: "tpl-1",
      version: 3,
    });
    expect(a.key).toBe(`templates/tpl-1/v3.${a.hash}.css`);
    expect(a.hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it("gives the same hash for an unchanged design", () => {
    const a = buildArtifact({
      definition: fixture(),
      templateId: "t",
      version: 1,
    });
    const b = buildArtifact({
      definition: fixture(),
      templateId: "t",
      version: 1,
    });
    expect(a.hash).toBe(b.hash);
  });

  it("changes the hash when the design changes", () => {
    const def = fixture();
    const a = buildArtifact({ definition: def, templateId: "t", version: 1 });
    def.tokens.color.primary = "#000000";
    const b = buildArtifact({ definition: def, templateId: "t", version: 1 });
    expect(a.hash).not.toBe(b.hash);
  });

  it("fingerprints independently of key order", () => {
    const a = { x: 1, y: { b: 2, a: 3 } };
    const b = { y: { a: 3, b: 2 }, x: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
    expect(definitionFingerprint(a as never)).toBe(
      definitionFingerprint(b as never),
    );
  });
});

// ─── Validator ───────────────────────────────────────────────────────────────

describe("validateDefinition", () => {
  it("accepts the fixture", () => {
    const r = validateDefinition(fixture());
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.stats.widgets).toBe(1);
  });

  it("rejects an unknown style property", () => {
    const def = fixture();
    (def.root.style!.base as Record<string, unknown>).wobble = "10px";
    const r = validateDefinition(def);
    expect(r.ok).toBe(false);
    expect(
      r.errors.some((e) => e.message.includes("unknown style property")),
    ).toBe(true);
  });

  it("rejects a value the compiler would silently drop", () => {
    const def = fixture();
    def.root.style!.base!.gap = "ten pixels" as never;
    const r = validateDefinition(def);
    expect(r.ok).toBe(false);
    expect(r.errors[0].path).toBe("root.style.base.gap");
  });

  it("rejects duplicate node ids", () => {
    const def = fixture();
    def.root.children!.push({
      kind: "element",
      id: "hdr",
      tag: "frame",
      children: [],
    });
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("duplicate node id"),
      ),
    ).toBe(true);
  });

  it("rejects duplicate widget content keys", () => {
    const def = fixture();
    def.root.children!.push(serviceWidget({ id: "svc2" }));
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("duplicate content key"),
      ),
    ).toBe(true);
  });

  it("rejects an unknown widget type", () => {
    const def = fixture();
    (def.root.children![1] as WidgetNode).widget = "NOPE";
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("unknown widget type"),
      ),
    ).toBe(true);
  });

  it("rejects userOptions that are not real design keys", () => {
    const def = fixture();
    (def.root.children![1] as WidgetNode).userOptions = ["layout", "notAThing"];
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("is not a design option"),
      ),
    ).toBe(true);
  });

  it("rejects a design value outside the widget schema", () => {
    const def = fixture();
    (def.root.children![1] as WidgetNode).design = { layout: "hexagon" };
    expect(validateDefinition(def).ok).toBe(false);
  });

  it("warns about part styles for a part that does not exist", () => {
    const def = fixture();
    (def.root.children![1] as WidgetNode).partStyles!.nonsense = {
      base: { gap: "4px" },
    };
    const r = validateDefinition(def);
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.message.includes("dead"))).toBe(true);
  });

  it("rejects children on a void tag", () => {
    const def = fixture();
    def.root.children!.push({
      kind: "element",
      id: "bad",
      tag: "text",
      children: [{ kind: "element", id: "kid", tag: "text" }],
    });
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("cannot have children"),
      ),
    ).toBe(true);
  });

  it("rejects an unknown card binding field", () => {
    const def = fixture();
    const avatar = (def.root.children![0] as ElementNode)
      .children![0] as ElementNode;
    avatar.bind = { source: "card", field: "salary" as never };
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("unknown card field"),
      ),
    ).toBe(true);
  });

  it("rejects a javascript: href", () => {
    const def = fixture();
    def.root.children!.push({
      kind: "element",
      id: "btn",
      tag: "button",
      props: { label: "x", href: "javascript:alert(1)" },
    });
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("unsupported URL scheme"),
      ),
    ).toBe(true);
  });

  it("rejects an invalid colour token", () => {
    const def = fixture();
    def.tokens.color.primary = "red; }";
    expect(
      validateDefinition(def).errors.some(
        (e) => e.path === "tokens.color.primary",
      ),
    ).toBe(true);
  });

  it("enforces the node cap", () => {
    const def = fixture();
    for (let i = 0; i < 520; i++) {
      def.root.children!.push({
        kind: "element",
        id: `n${i}`,
        tag: "frame",
        children: [],
      });
    }
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("too many nodes"),
      ),
    ).toBe(true);
  });

  it("rejects a slot that allows a derived widget", () => {
    const def = fixture();
    def.root.children!.push({
      kind: "slot",
      id: "sl",
      key: "extra",
      label: "Extra",
      allow: ["CONTACT_LINKS"],
    });
    expect(
      validateDefinition(def).errors.some((e) =>
        e.message.includes("cannot be user-added"),
      ),
    ).toBe(true);
  });
});

// ─── Content schema → validator ──────────────────────────────────────────────

describe("schemaToZod", () => {
  const schema = manifest().find(
    (m) => m.type === "SERVICE_LIST",
  )!.contentSchema;

  it("accepts valid content", () => {
    const r = validateAgainstSchema(schema, {
      title: "Services",
      items: [
        {
          name: "Design",
          description: "",
          price: "",
          link: "https://x.com",
          image: "",
        },
      ],
    });
    expect(r.issues).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("rejects a repeater row missing a required field", () => {
    const r = validateAgainstSchema(schema, {
      items: [{ description: "no name" }],
    });
    expect(r.ok).toBe(false);
    expect(r.issues[0].path).toContain("items.0.name");
  });

  it("enforces the repeater cap", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `s${i}` }));
    expect(validateAgainstSchema(schema, { items }).ok).toBe(false);
  });

  it("rejects a javascript: URL", () => {
    const r = validateAgainstSchema(schema, {
      items: [{ name: "x", link: "javascript:alert(1)" }],
    });
    expect(r.ok).toBe(false);
  });

  it("honours the image host allowlist", () => {
    const good = validateAgainstSchema(
      schema,
      { items: [{ name: "x", image: "https://cdn.tapsleek.com/a.jpg" }] },
      { imageHosts: ["cdn.tapsleek.com"] },
    );
    const bad = validateAgainstSchema(
      schema,
      { items: [{ name: "x", image: "https://evil.example/a.jpg" }] },
      { imageHosts: ["cdn.tapsleek.com"] },
    );
    expect(good.ok).toBe(true);
    expect(bad.ok).toBe(false);
  });

  it("strips unknown keys instead of rejecting them", () => {
    const r = validateAgainstSchema(schema, {
      title: "x",
      fromAFutureDeploy: 1,
    });
    expect(r.ok).toBe(true);
    expect(r.value).not.toHaveProperty("fromAFutureDeploy");
  });
});

// ─── Migration ───────────────────────────────────────────────────────────────

describe("content migration", () => {
  it("migrates SERVICE_LIST v1 → v2 (url → link)", () => {
    const r = migrateWidgetContent("SERVICE_LIST", {
      [VERSION_KEY]: 1,
      heading: "Old heading",
      items: [{ label: "Design", url: "https://x.com", desc: "old" }],
    });
    expect(r.changed).toBe(true);
    expect(r.content.title).toBe("Old heading");
    expect((r.content.items as any[])[0]).toMatchObject({
      name: "Design",
      link: "https://x.com",
      description: "old",
    });
  });

  it("is a no-op at the current version", () => {
    const r = migrateWidgetContent("SERVICE_LIST", {
      [VERSION_KEY]: 2,
      title: "x",
      items: [],
    });
    expect(r.changed).toBe(false);
  });

  it("leaves content from a newer deploy untouched", () => {
    const r = migrateWidgetContent("SERVICE_LIST", {
      [VERSION_KEY]: 99,
      title: "future",
    });
    expect(r.changed).toBe(false);
    expect(r.content.title).toBe("future");
  });

  it("never throws on garbage", () => {
    expect(() =>
      migrateWidgetContent("SERVICE_LIST", [] as never),
    ).not.toThrow();
    expect(() => migrateWidgetContent("SERVICE_LIST", null)).not.toThrow();
    expect(() => migrateWidgetContent("NOT_A_WIDGET", { a: 1 })).not.toThrow();
  });

  it("leaves orphaned keys alone", () => {
    const r = migrateCardContent({ gone: { [VERSION_KEY]: 1, a: 1 } }, {});
    expect(r.content.gone).toEqual({ [VERSION_KEY]: 1, a: 1 });
  });

  it("stamps the current version after migrating", () => {
    const def = fixture();
    const r = migrateCardContent(
      { services_main: { [VERSION_KEY]: 1, items: [{ label: "a" }] } },
      widgetTypeMap(def),
    );
    expect(r.content.services_main[VERSION_KEY]).toBe(2);
  });
});

// ─── Template switching ──────────────────────────────────────────────────────

describe("switchTemplateContent", () => {
  const from = fixture();

  function toDefinition(widgetOver: Partial<WidgetNode>): TemplateDefinition {
    const def = blankDefinition("Target");
    def.root.children = [serviceWidget({ id: "x1", ...widgetOver })];
    return def;
  }

  it("carries content across when the role matches", () => {
    const to = toDefinition({ key: "my_services", role: "services" });
    const r = switchTemplateContent(
      {
        services_main: {
          [VERSION_KEY]: 2,
          title: "Kept",
          items: [{ name: "a" }],
        },
      },
      from,
      to,
    );
    expect(r.content.my_services.title).toBe("Kept");
    expect(r.mapping.services_main).toBe("my_services");
    expect(r.archive).toEqual([]);
  });

  it("falls back to widget type when the role differs", () => {
    const to = toDefinition({ key: "k", role: "offerings" });
    const r = switchTemplateContent(
      { services_main: { [VERSION_KEY]: 2, title: "Kept", items: [] } },
      from,
      to,
    );
    expect(r.content.k.title).toBe("Kept");
  });

  it("archives rather than deletes unmatched content", () => {
    const to = blankDefinition("Empty");
    const r = switchTemplateContent(
      {
        services_main: {
          [VERSION_KEY]: 2,
          title: "Precious",
          items: [{ name: "a" }],
        },
      },
      from,
      to,
      { fromTemplateId: "tpl-old" },
    );
    expect(r.content).toEqual({});
    expect(r.archive).toHaveLength(1);
    expect(r.archive[0]).toMatchObject({
      key: "services_main",
      widget: "SERVICE_LIST",
      fromTemplateId: "tpl-old",
    });
    expect(r.archive[0].content.title).toBe("Precious");
  });

  it("migrates old content while carrying it", () => {
    const to = toDefinition({ key: "k", role: "services" });
    const r = switchTemplateContent(
      {
        services_main: {
          [VERSION_KEY]: 1,
          heading: "Old",
          items: [{ label: "a", url: "https://x.com" }],
        },
      },
      from,
      to,
    );
    expect(r.content.k.title).toBe("Old");
    expect((r.content.k.items as any[])[0].link).toBe("https://x.com");
    expect(r.content.k[VERSION_KEY]).toBe(2);
  });

  it("uses the target template demo content when nothing matches", () => {
    const to = toDefinition({
      key: "fresh",
      role: "nothing_like_it",
      widget: "FAQ",
    });
    const r = switchTemplateContent({}, from, to);
    expect(r.content.fresh).toBeDefined();
  });

  it("does not archive content that is effectively empty", () => {
    const to = blankDefinition("Empty");
    const r = switchTemplateContent(
      { services_main: { [VERSION_KEY]: 2, title: "", items: [] } },
      from,
      to,
    );
    expect(r.archive).toEqual([]);
  });
});

describe("seedContentFromTemplate", () => {
  it("seeds every editable widget and skips derived ones", () => {
    const def = fixture();
    def.root.children!.push({
      kind: "widget",
      id: "lnk",
      widget: "CONTACT_LINKS",
      key: "links_main",
      label: "Links",
    } as WidgetNode);
    const seeded = seedContentFromTemplate(def);
    expect(seeded.services_main).toBeDefined();
    expect(seeded.links_main).toBeUndefined();
  });
});

// ─── Generic widget suite (every widget gets this for free) ──────────────────

describe("widget registry", () => {
  it("has no duplicate types", () => {
    expect(new Set(WIDGET_TYPES).size).toBe(WIDGET_TYPES.length);
  });

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: meta is well formed",
    (_type: string, meta: any) => {
      expect(meta.label).toBeTruthy();
      expect(meta.iconName).toMatch(/^[A-Za-z0-9]+$/);
      expect(meta.contentVersion).toBeGreaterThanOrEqual(1);
      if (!meta.defaultLayout) {
        expect(meta.parts!.length).toBeGreaterThan(0);
        expect(new Set(meta.parts!.map((p) => p.key)).size).toBe(
          meta.parts!.length,
        );
      }
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: manifest survives JSON round-trip",
    (_type: string, meta: any) => {
      expect(JSON.parse(JSON.stringify(meta))).toEqual(meta);
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: defaultContent satisfies contentSchema",
    (_type: string, meta: any) => {
      if (meta.derived) return;
      const r = validateAgainstSchema(meta.contentSchema, meta.defaultContent);
      expect(r.issues).toEqual([]);
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: defaultDesign satisfies designSchema",
    (_type: string, meta: any) => {
      const r = validateAgainstSchema(
        meta.designSchema ?? [],
        meta.defaultDesign,
      );
      expect(r.issues).toEqual([]);
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: field keys are unique at every level",
    (_type: string, meta: any) => {
      for (const fields of [meta.contentSchema, meta.designSchema ?? []]) {
        const seen = new Set<string>();
        for (const f of fields) {
          expect(seen.has(f.key)).toBe(false);
          seen.add(f.key);
        }
      }
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: visibleIf references a known field",
    (_type: string, meta: any) => {
      // Renderer and builder evaluate visibleIf against design + content
      // merged (`_design`), so a design option may depend on a content
      // toggle (carousel options → `useCarousel`) and vice versa.
      const keys = new Set(
        [...meta.contentSchema, ...(meta.designSchema ?? [])].map((f) => f.key),
      );
      for (const fields of [meta.contentSchema, meta.designSchema ?? []]) {
        for (const f of fields) {
          if (f.visibleIf) expect(keys.has(f.visibleIf.key)).toBe(true);
        }
      }
      for (const p of meta.parts ?? []) {
        if (p.visibleIf) expect(keys.has(p.visibleIf.key)).toBe(true);
      }
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: defaultsFor produces schema-valid content",
    (_type: string, meta: any) => {
      if (meta.derived) return;
      const defaults = defaultsFor(meta.contentSchema);
      expect(() => JSON.stringify(defaults)).not.toThrow();
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: nested fields stay within the depth limit",
    (_type: string, meta: any) => {
      let max = 0;
      walkFields(meta.contentSchema, (_f, _p, depth) => {
        max = Math.max(max, depth);
      });
      expect(max).toBeLessThanOrEqual(2);
    },
  );

  it.each(manifest().map((m) => [m.type, m] as const))(
    "%s: every part is stylable and compiles",
    (_type: string, meta: any) => {
      const def = blankDefinition("Parts");
      const partStyles: Record<string, unknown> = {};
      for (const p of meta.parts ?? [])
        partStyles[p.key] = { base: { gap: "{space.2}" } };
      def.root.children = [
        {
          kind: "widget",
          id: "w1",
          widget: meta.type,
          key: "w_key",
          label: meta.label,
          design: meta.defaultDesign,
          defaultContent: meta.derived ? undefined : meta.defaultContent,
          partStyles,
        } as WidgetNode,
      ];
      const validation = validateDefinition(def);
      expect(validation.errors).toEqual([]);
      const { css } = compileCss(def);
      for (const p of meta.parts ?? [])
        expect(css).toContain(`.nw1 .p-${p.key}`);
    },
  );

  it("exposes part keys for a known widget", () => {
    expect(partKeys("SERVICE_LIST")).toContain("item");
    expect(partKeys("NOPE")).toEqual([]);
  });
});

// ─── Misc guards ─────────────────────────────────────────────────────────────

describe("safeUrl", () => {
  it.each([
    ["https://cdn.tapsleek.com/a.png", true],
    ["http://cdn.tapsleek.com/a.png", false],
    ["javascript:alert(1)", false],
    ['https://x.com/a").png', false],
    ["//cdn.tapsleek.com/a.png", false],
  ])("%s → %s", (url, expected) => {
    expect(safeUrl(url) !== null).toBe(expected);
  });
});

describe("declarationsFor", () => {
  it("expands lineClamp into the webkit trio", () => {
    expect(declarationsFor({ lineClamp: 2 })).toEqual([
      ["display", "-webkit-box"],
      ["-webkit-line-clamp", "2"],
      ["-webkit-box-orient", "vertical"],
      ["overflow", "hidden"],
    ]);
  });

  it("keeps line-height unitless when given a number", () => {
    expect(declarationsFor({ lineHeight: 1.5 })).toEqual([
      ["line-height", "1.5"],
    ]);
  });

  it("collapses a uniform Box4 to one value", () => {
    expect(declarationsFor({ padding: { all: "16px" } })).toEqual([
      ["padding", "16px"],
    ]);
  });

  it("emits a 4-value box when sides differ", () => {
    expect(
      declarationsFor({
        padding: { t: "4px", r: "8px", b: "12px", l: "16px" },
      }),
    ).toEqual([["padding", "4px 8px 12px 16px"]]);
  });

  it("ignores properties outside the whitelist", () => {
    expect(declarationsFor({ content: '"x"' } as never)).toEqual([]);
  });
});

// ─── v2.1 — Blocks + Theme ────────────────────────────────────────────────────

describe("blocks: resolveBlockDesign", () => {
  it("uses the template instance design + partStyles when present", () => {
    const d = resolveBlockDesign(fixture(), "SERVICE_LIST");
    // fixture()'s SERVICE_LIST has partStyles.item / .list and design.layout
    expect(d.partStyles.item).toBeTruthy();
    expect(d.partStyles.list).toBeTruthy();
    expect(d.design.layout).toBe("grid-2");
  });

  it("falls back to the widget meta default for a type the template never used", () => {
    const d = resolveBlockDesign(fixture(), "FAQ");
    expect(typeof d.design).toBe("object");
    // FAQ ships defaultPartStyles in its meta, so a block is never raw HTML
    expect(Object.keys(d.partStyles).length).toBeGreaterThan(0);
  });

  it("blockClass is a safe, type-scoped class", () => {
    expect(blockClass("SERVICE_LIST")).toBe("tsb-SERVICE_LIST");
    expect(blockClass("a b;{}")).toBe("tsb-ab");
  });
});

describe("blocks: userBlockTypes", () => {
  it("excludes derived identity widgets and the lead form", () => {
    const list = userBlockTypes(manifest());
    expect(list).not.toContain("PROFILE");
    expect(list).not.toContain("CONTACT_LINKS");
    expect(list).not.toContain("LEAD_FORM");
    expect(list).toContain("SERVICE_LIST");
    expect(list).toContain("FAQ");
  });
});

describe("compileCss: block presets (emitBlockPresets)", () => {
  it("default omits block presets — the pre-2.1 artifact is unchanged", () => {
    expect(compileCss(fixture()).css).not.toContain(".tsb-");
  });

  it('"template" emits .tsb-<type> for the types the template uses', () => {
    const { css } = compileCss(fixture(), { emitBlockPresets: "template" });
    expect(css).toContain(".tsb-SERVICE_LIST .p-item");
    expect(css).not.toContain(".tsb-FAQ"); // FAQ isn't in the fixture
  });

  it('"all" also covers types the template never used', () => {
    const { css } = compileCss(fixture(), { emitBlockPresets: "all" });
    expect(css).toContain(".tsb-SERVICE_LIST");
    expect(css).toContain(".tsb-FAQ");
  });

  it("block presets follow the desktop-first cascade (max-width)", () => {
    const def = fixture();
    (def.root.children![1] as WidgetNode).partStyles = {
      item: {
        base: { padding: { all: "16px" } },
        md: { padding: { all: "8px" } },
      },
    };
    const { css } = compileCss(def, { emitBlockPresets: "template" });
    expect(css).toContain("@media (max-width:768px)");
  });
});

describe("compileCardTheme", () => {
  it("maps colours, font, radius and density onto override vars", () => {
    const css = compileCardTheme(
      {
        colors: { primary: "#E11D48", text: "#000000" },
        fontFamily: "Poppins",
        radius: 20,
        density: 24,
      },
      "ts-card-abc",
    );
    expect(css).toContain("@layer ts-override");
    expect(css).toContain("--c-primary:#E11D48");
    expect(css).toContain("--f-heading:'Poppins', sans-serif");
    expect(css).toContain("--r-md:20px");
    expect(css).toContain("--sp-4:24px");
  });

  it("drops hostile / invalid values", () => {
    const css = compileCardTheme(
      { colors: { primary: "red; } body{display:none}" } },
      "ts-card-abc",
    );
    expect(css).not.toContain("display:none");
  });

  it("returns empty string for an empty theme", () => {
    expect(compileCardTheme({}, "ts-card-abc")).toBe("");
    expect(compileCardTheme(null, "ts-card-abc")).toBe("");
  });
});

// ─── Composite widgets (layout subtree) ──────────────────────────────────────
//
// A composite widget renders an editable ElementNode subtree instead of a
// hardcoded component. Its leaves bind to the widget's OWN content (source:
// "self"), the designer can reorder/wrap them, and the end-user still only
// edits contentSchema. These tests lock the three integration points the
// feature depends on: binding resolution, CSS compilation over the subtree,
// and validation of the designer-authored tree.

describe("composite widgets — layout subtree", () => {
  function iconNode(over: Record<string, unknown> = {}): ElementNode {
    return {
      id: "licon",
      kind: "element",
      tag: "icon",
      bind: { source: "self", path: "icon" },
      hideIfEmpty: true,
      style: {
        base: { strokeWidth: 3, color: "{color.primary}", fontSize: "{size.xl}" },
      },
      ...over,
    } as ElementNode;
  }

  function compositeButton(layoutOver: Record<string, unknown> = {}): WidgetNode {
    return {
      kind: "widget",
      id: "btn",
      widget: "CTA_BUTTON",
      key: "cta_main",
      label: "Button",
      defaultContent: { label: "Book", url: "https://x.com", icon: "Calendar" },
      layout: {
        id: "lroot",
        kind: "element",
        tag: "frame",
        children: [
          {
            id: "lbtn",
            kind: "element",
            tag: "link",
            bind: { source: "self", path: "url" },
            children: [
              iconNode(),
              {
                id: "llabel",
                kind: "element",
                tag: "text",
                bind: { source: "self", path: "label" },
              },
            ],
          },
        ],
        ...layoutOver,
      },
    } as WidgetNode;
  }

  // ── Binding: a leaf reads the enclosing widget's own content ──
  describe("resolveBinding", () => {
    const content = { cta_main: { label: "Hello", icon: "Star" } };

    it("self binding reads the widget content via selfData", () => {
      const self = content.cta_main;
      expect(resolveBinding({ source: "self", path: "label" }, {}, {}, self)).toBe("Hello");
      expect(resolveBinding({ source: "self", path: "icon" }, {}, {}, self)).toBe("Star");
    });

    it("self binding walks a nested path", () => {
      const self = { cta: { link: { url: "https://a.b" } } };
      expect(
        resolveBinding({ source: "self", path: "cta.link.url" }, {}, {}, self),
      ).toBe("https://a.b");
    });

    it("widget binding resolves content[key] by path", () => {
      expect(
        resolveBinding({ source: "widget", key: "cta_main", path: "label" }, {}, content),
      ).toBe("Hello");
    });

    it("returns undefined for a missing leaf (this is what drives hideIfEmpty)", () => {
      expect(
        resolveBinding({ source: "self", path: "caption" }, {}, {}, content.cta_main),
      ).toBeUndefined();
    });
  });

  // ── Compile: every subtree node is scoped under the widget, not as a part ──
  it("compiles each layout node under the widget, incl. icon stroke-width", () => {
    const def = blankDefinition("t");
    def.root.children = [compositeButton()];
    const { css } = compileCss(def);
    // Nested `.n<widget> .n<layoutNode>` selector — NOT a `.p-<part>` selector.
    expect(css).toContain(".nbtn .nlicon");
    expect(css).toContain("stroke-width:3");
    // The reset makes the lucide <svg> inherit that stroke-width from the node.
    expect(css).toContain("svg{stroke-width:inherit}");
  });

  // ── Validate: the designer-authored subtree is guarded ──
  // Atomic widgets legitimately use a leaf root (IMAGE's layout root IS the
  // <img>), so the guard is "a root with children must be a container".
  it("rejects a layout root that is a leaf but has children", () => {
    const def = blankDefinition("t");
    def.root.children = [compositeButton()];
    (def.root.children[0] as WidgetNode).layout!.tag = "text" as ElementNode["tag"];
    const r = validateDefinition(def);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e: any) => /cannot have children/.test(e.message))).toBe(true);
  });

  it("accepts a well-formed frame layout (no .layout errors)", () => {
    const def = blankDefinition("t");
    def.root.children = [compositeButton()];
    const r = validateDefinition(def);
    const layoutErrors = r.errors.filter((e: any) => e.path.includes(".layout"));
    expect(layoutErrors).toEqual([]);
  });

  it("allows layout node ids to repeat across widgets and match the template root", () => {
    // defaultLayout subtrees ship generic ids ("root", "icon", "label"). Since
    // the compiler scopes them under their widget, these are NOT global — two
    // composite widgets may reuse them, and they may match the template root id
    // ("root"). Publish must not reject this as a duplicate-id collision.
    const mk = (id: string, key: string): WidgetNode =>
      ({
        kind: "widget",
        id,
        widget: "CTA_BUTTON",
        key,
        label: "Button",
        defaultContent: { label: "Go", url: "https://x.com", icon: "Star" },
        layout: {
          id: "root", // ← collides with the template root + the other widget
          kind: "element",
          tag: "frame",
          children: [
            { id: "icon", kind: "element", tag: "icon", bind: { source: "self", path: "icon" } },
            { id: "label", kind: "element", tag: "text", bind: { source: "self", path: "label" } },
          ],
        },
      }) as WidgetNode;

    const def = blankDefinition("t"); // def.root.id === "root"
    def.root.children = [mk("btn1", "cta_a"), mk("btn2", "cta_b")];
    const r = validateDefinition(def);
    const dupErrors = r.errors.filter((e: any) => /duplicate node id/.test(e.message));
    expect(dupErrors).toEqual([]);
  });
});

describe("Render Layer Security", () => {
  it("sanitizes icon widget custom SVG", () => {
    const node = {
      kind: "element",
      id: "icon1",
      tag: "icon",
      props: { name: { type: "svg", svg: "<svg><script>alert(1)</script><path d='M0 0'/></svg>" } },
    } as any;
    const ctx = { isEditing: false, track: () => {} } as any;
    const html = renderToStaticMarkup(React.createElement(NodeRenderer, { node, content: {}, ctx }));
    expect(html).not.toContain("script");
    expect(html).toContain("path");
  });

  it("sanitizes embed widget iframe and enforces sandbox", () => {
    const node = {
      kind: "element",
      id: "embed1",
      tag: "embed",
      props: { html: "<iframe src='https://youtube.com/embed/123' allow='autoplay; camera'></iframe>" },
    } as any;
    const ctx = { isEditing: false, track: () => {} } as any;
    const html = renderToStaticMarkup(React.createElement(NodeRenderer, { node, content: {}, ctx }));
    expect(html).toContain("sandbox=");
    expect(html).not.toContain("camera");
    expect(html).toContain("youtube.com");
  });

  it("strips embed widget iframe with unallowed domain", () => {
    const node = {
      kind: "element",
      id: "embed2",
      tag: "embed",
      props: { html: "<iframe src='https://evil.com/embed'></iframe>" },
    } as any;
    const ctx = { isEditing: false, track: () => {} } as any;
    const html = renderToStaticMarkup(React.createElement(NodeRenderer, { node, content: {}, ctx }));
    expect(html).not.toContain("evil.com");
    expect(html).not.toContain("iframe");
  });
});

// ─── Regressions (audit 2026-10) ─────────────────────────────────────────────

import { CardRenderer } from "./render/CardRenderer";
import { safeHref, sanitizeHtml } from "./render/sanitize";
import { collectWidgets } from "./types/node";
import { getWidgetMeta } from "./widgets/registry";

function renderCard(def: TemplateDefinition, content: any = {}, card: any = {}) {
  return renderToStaticMarkup(
    React.createElement(CardRenderer as any, {
      definition: def,
      content,
      card,
      links: [],
      isEditing: false,
    }),
  );
}

function widgetDef(type: string, content?: any, design?: any): TemplateDefinition {
  const meta = getWidgetMeta(type)!;
  const def = blankDefinition("t");
  def.root.children = [
    {
      kind: "widget",
      id: "w1",
      widget: type,
      key: "k1",
      label: type,
      defaultContent: content ?? meta.defaultContent,
      design: design ?? meta.defaultDesign,
    } as WidgetNode,
  ];
  return def;
}

describe("server-side sanitization (no DOM)", () => {
  it("strips event handlers and scripts from rich text during SSR", () => {
    const html = renderToStaticMarkup(
      React.createElement(NodeRenderer, {
        node: { kind: "element", id: "rt", tag: "richtext", props: { html: '<p>hi<img src=x onerror="alert(1)"><script>alert(2)</script></p>' } } as any,
        content: {},
        ctx: { isEditing: false, track: () => {} } as any,
      }),
    );
    expect(html).toContain("<p>hi");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("script");
  });

  it("neutralises javascript: links and keeps safe ones", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<a href="https://x.com" target="_blank">x</a>')).toContain('rel="noopener noreferrer"');
    expect(safeHref("JaVa\tScRiPt:alert(1)")).toBe(null);
    expect(safeHref("//evil.com")).toBe(null);
    expect(safeHref("tel:+15550100")).toBe("tel:+15550100");
  });

  it("drops mXSS-style nesting instead of re-emitting it", () => {
    const out = sanitizeHtml('<svg><style><img src=x onerror=alert(1)></style></svg><p>ok</p>');
    expect(out).not.toContain("onerror");
    expect(out).toContain("<p>ok</p>");
  });
});

describe("template props are not a raw-HTML channel", () => {
  it("rejects and does not render props.dangerouslySetInnerHTML", () => {
    const def = blankDefinition("t");
    def.root.children = [
      { kind: "element", id: "x1", tag: "frame", props: { dangerouslySetInnerHTML: { __html: "<img src=x onerror=alert(1)>" } } as any },
    ];
    expect(validateDefinition(def).ok).toBe(false);
    expect(renderCard(def)).not.toContain("onerror");
  });

  it("does not let props.as turn a frame into <script>", () => {
    const def = blankDefinition("t");
    def.root.children = [{ kind: "element", id: "x2", tag: "frame", props: { as: "script" } } as any];
    expect(validateDefinition(def).ok).toBe(false);
    expect(renderCard(def)).not.toContain("<script");
  });
});

describe("widget wrappers don't inherit the template root's rule", () => {
  it("widget wrapper carries .n<widgetId>, never .nroot", () => {
    const html = renderCard(widgetDef("TITLE"));
    expect(html).toMatch(/class="nw1[^"]*"/);
    // Only the template root itself may carry `nroot`.
    expect(html.match(/\bnroot\b/g)?.length).toBe(1);
  });
});

describe("business hours & appointment layouts", () => {
  it("shows weekday names, a time range and Closed", () => {
    const html = renderCard(widgetDef("BUSINESS_HOURS"));
    expect(html).toContain("Monday");
    expect(html).toContain("9:00 AM – 5:00 PM");
    expect(html).toContain("Closed");
  });

  it("respects the 24h time format", () => {
    const meta = getWidgetMeta("BUSINESS_HOURS")!;
    const html = renderCard(widgetDef("BUSINESS_HOURS", meta.defaultContent, { ...meta.defaultDesign, timeFormat: "24h" }));
    expect(html).toContain("09:00 – 17:00");
  });

  it("appointment button links to the booking flow and shows its label", () => {
    const content = { title: "Book", buttonLabel: "Choose a time", profile: { slug: "intro-call" } };
    const html = renderCard(widgetDef("APPOINTMENT", content), { k1: content });
    expect(html).toContain('href="/appt/intro-call"');
    expect(html).toContain("Choose a time");
  });
});

describe("nested widgets", () => {
  it("collectWidgets finds a widget placed inside another widget's layout", () => {
    const def = blankDefinition("t");
    const layout = JSON.parse(JSON.stringify(getWidgetMeta("PROFILE")!.defaultLayout));
    layout.children.push({ kind: "widget", id: "wcb", widget: "CONNECT_BUTTONS", key: "cb", label: "CB" });
    def.root.children = [{ kind: "widget", id: "wp", widget: "PROFILE", key: "profile", label: "P", layout } as WidgetNode];
    expect(collectWidgets(def.root).map((w) => w.key)).toEqual(["profile", "cb"]);
    expect(renderCard(def)).toContain('data-widget="CONNECT_BUTTONS"');
  });
});
