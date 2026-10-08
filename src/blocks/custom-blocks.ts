import type { ElementNode, Node } from "../types/node";
import type {
  CustomBlockField,
  TemplateCustomBlock,
  TemplateDefinition,
} from "../types/definition";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Deep clone an element node tree while ensuring node IDs are scoped
 * to prevent collision with card root or other blocks.
 */
function cloneAndScopeTree(node: Node, prefix: string): Node {
  const cloned = JSON.parse(JSON.stringify(node)) as Node;

  function walk(n: any) {
    if (!n || typeof n !== "object") return;
    if (n.id) {
      if (n.id === "root" || n.id.includes("root")) {
        n.id = `${prefix}_${n.id}`;
      }
    }
    if (Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
    if (n.layout) {
      walk(n.layout);
    }
  }

  walk(cloned);
  return cloned;
}

/** Identity of a field across re-syncs: the child layer + the prop it fills. */
function fieldId(nodeId: string, prop: string | undefined): string {
  return `${nodeId}:${prop ?? ""}`;
}

/** Turn an inner widget node into a plain element in place. */
function toElement(
  n: Node,
  tag: ElementNode["tag"],
  props?: Record<string, unknown>,
): ElementNode {
  const el = n as unknown as ElementNode;
  el.kind = "element";
  el.tag = tag;
  if (props) el.props = props as ElementNode["props"];
  delete (el as any).widget;
  delete (el as any).key;
  delete (el as any).label;
  delete (el as any).defaultContent;
  return el;
}

/**
 * Inspects an ElementNode (e.g. a Frame/Group) and discovers every child layer
 * that carries content (headings, texts, images, icons, videos, buttons,
 * links and inner widgets).
 *
 * The input is never mutated. `layout` is a clone where inner widgets are
 * flattened to elements and editor-only `self` bindings are removed — content
 * is applied by writing each field's value into `props[field.prop]` at render
 * time (see `applyCustomBlockContent`).
 *
 * Pass `previous` (a block's existing fields) to keep keys, labels and the
 * "user can edit" flag stable across re-syncs, so content already saved on
 * cards keeps landing on the same layers.
 */
export function extractFieldsFromNode(
  rootNode: Node,
  previous: CustomBlockField[] = [],
): {
  fields: CustomBlockField[];
  defaultContent: Record<string, unknown>;
  layout: Node;
} {
  const layout = JSON.parse(JSON.stringify(rootNode)) as Node;
  const fields: CustomBlockField[] = [];
  const defaultContent: Record<string, unknown> = {};
  const prevById = new Map(previous.map((f) => [fieldId(f.nodeId, f.prop), f]));
  const seenKeys = new Set<string>(previous.map((f) => f.key));
  const usedKeys = new Set<string>();

  function uniqueKey(base: string): string {
    let key = base;
    let idx = 1;
    while (seenKeys.has(key)) {
      idx++;
      key = `${base}_${idx}`;
    }
    seenKeys.add(key);
    return key;
  }

  function add(
    nodeId: string,
    prop: string,
    base: string,
    label: string,
    type: CustomBlockField["type"],
    value: unknown,
  ): string {
    const prev =
      prevById.get(fieldId(nodeId, prop)) ??
      // Blocks made before `prop` existed: match on the layer alone.
      previous.find((f) => f.nodeId === nodeId && !f.prop && !usedKeys.has(f.key));
    const key = prev && !usedKeys.has(prev.key) ? prev.key : uniqueKey(base);
    usedKeys.add(key);
    fields.push({
      nodeId,
      key,
      prop,
      label: prev?.label ?? label,
      type,
      default: value,
      ...(prev?.hint ? { hint: prev.hint } : {}),
      ...(prev?.editable === false ? { editable: false } : {}),
    });
    defaultContent[key] = value;
    return key;
  }

  const str = (v: unknown, fallback = ""): unknown => v ?? fallback;

  function walk(n: Node) {
    if (n.kind === "element") {
      // A repeater's rows bind to their item — data, not template content.
      if (n.repeat) return;
      // Bindings to card data stay live — they are not template content.
      if (n.bind?.source === "self") delete n.bind;
      const cardBound = Boolean(n.bind);
      const tag = n.tag;
      const named = n.name && n.name !== n.id ? n.name : null;
      const props = (n.props ?? {}) as Record<string, unknown>;
      const isSystemAction =
        typeof props.action === "string" && props.action.startsWith("carousel-");

      if (!cardBound && !isSystemAction) {
        if (tag === "heading") {
          add(n.id, "text", "title", named ?? "Heading", "text", str(props.text ?? props.content, ""));
        } else if (tag === "text") {
          add(n.id, "text", "description", named ?? "Text", "textarea", str(props.text ?? props.content, ""));
        } else if (tag === "richtext") {
          add(n.id, "html", "description", named ?? "Rich Text", "richtext", str(props.html, ""));
        } else if (tag === "image") {
          add(n.id, "src", "imageUrl", named ?? "Image", "image", str(props.src, ""));
        } else if (tag === "icon") {
          add(n.id, "name", "icon", named ?? "Icon", "icon", str(props.name, ""));
        } else if (tag === "video") {
          add(n.id, "url", "videoUrl", named ?? "Video", "video", str(props.url, ""));
        } else if (tag === "button") {
          add(n.id, "label", "buttonText", named ? `${named} Label` : "Button Label", "text", str(props.label ?? props.text, ""));
        }

        const linkLike =
          tag === "button" || tag === "link" || (tag === "frame" && props.as === "a");
        if (linkLike && (!props.action || props.action === "link")) {
          add(
            n.id,
            "href",
            "buttonUrl",
            named ? `${named} Link` : tag === "button" ? "Button Link" : "Link URL",
            "url",
            str(props.href ?? props.url, ""),
          );
        }
      }

      if (Array.isArray(n.children)) n.children.forEach(walk);
      return;
    }

    if (n.kind === "widget") {
      const widgetType = (n.widget || "").toUpperCase();
      const label = n.label || n.name || widgetType;
      const def = (n.defaultContent || {}) as Record<string, any>;

      if (widgetType === "VIDEO") {
        const url = str(def.url, "");
        toElement(n, "video", { url });
        add(n.id, "url", "videoUrl", `${label} URL`, "video", url);
      } else if (widgetType === "TITLE" || widgetType === "HEADING") {
        const text = str(def.text, "");
        toElement(n, "heading", { text, level: def.level ?? 2 });
        add(n.id, "text", "title", `${label} Text`, "text", text);
      } else if (widgetType === "RICH_TEXT") {
        const html = str(def.text ?? def.html, "");
        toElement(n, "richtext", { html });
        add(n.id, "html", "description", `${label} Text`, "richtext", html);
      } else if (widgetType === "DESCRIPTION" || widgetType === "TEXT") {
        const text = str(def.text, "");
        toElement(n, "text", { text });
        add(n.id, "text", "description", `${label} Text`, "textarea", text);
      } else if (widgetType === "MAP" || widgetType === "MAPS") {
        const text = str(def.address, "");
        const el = toElement(n, "text", { text });
        const key = add(n.id, "text", "address", `${label} Address`, "text", text);
        // The address formatter only runs on bound values.
        el.bind = { source: "self", path: key, format: "mapAddress" };
      } else if (widgetType === "IMAGE" || widgetType === "AVATAR" || widgetType === "LOGO") {
        const src = str(def.url ?? def.src, "");
        toElement(n, "image", { src });
        add(n.id, "src", "imageUrl", `${label} Image`, "image", src);
      } else if (widgetType === "ICON") {
        const name = str(def.name, "Star");
        toElement(n, "icon", { name });
        add(n.id, "name", "icon", `${label} Icon`, "icon", name);
      } else if (widgetType === "DIVIDER") {
        toElement(n, "divider");
      } else if (widgetType === "SPACER") {
        toElement(n, "spacer");
      }
    }
  }

  walk(layout);
  return { fields, defaultContent, layout };
}

/**
 * Creates a TemplateCustomBlock from a selected Frame/Container node.
 */
export function createCustomBlockFromNode(
  node: Node,
  label: string,
  icon: string = "Layout",
  description?: string,
): TemplateCustomBlock {
  const safeIdBase = slugify(label) || "block";
  const blockId = `block_${safeIdBase}_${Math.random().toString(36).slice(2, 6)}`;

  const { fields, defaultContent, layout } = extractFieldsFromNode(
    cloneAndScopeTree(node, blockId),
  );

  return {
    id: blockId,
    label: label.trim() || "Custom Block",
    icon: icon || "Layout",
    description:
      description ||
      `Custom block based on ${(node as any).name || (node as any).label || "group"}`,
    sourceNodeId: node.id,
    layout,
    fields,
    defaultContent,
  };
}

/**
 * Re-derive a block from its source layer: picks up every style, structure and
 * default-content change the admin made after "Make Widget", while keeping
 * field keys / labels / editable flags stable.
 */
export function syncCustomBlock(
  block: TemplateCustomBlock,
  sourceNode: Node,
): TemplateCustomBlock {
  const { fields, defaultContent, layout } = extractFieldsFromNode(
    cloneAndScopeTree(sourceNode, block.id),
    block.fields ?? [],
  );
  return { ...block, layout, fields, defaultContent };
}

function findById(root: Node, id: string): Node | null {
  if (root.id === id) return root;
  if (root.kind === "element" && root.children) {
    for (const c of root.children) {
      const hit = findById(c, id);
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * Earlier versions of "Make Widget" wrote `{ source: "self" }` bindings onto
 * the source layers themselves. Outside a widget a self binding falls back to
 * the whole card's content map, so a heading bound to `title` rendered some
 * other widget's title and a text bound to `description` rendered blank.
 * Strips them from every custom block's source subtree (repeaters and inner
 * widgets are left alone — their self bindings are real). Returns the same
 * object when nothing needed cleaning.
 */
export function cleanCustomBlockSources<T extends TemplateDefinition>(def: T): T {
  if (!def.customBlocks?.length || !def.root) return def;
  const sources = new Set(
    def.customBlocks
      .filter((cb) => !cb.libraryId)
      .map((cb) => cb.sourceNodeId)
      .filter(Boolean) as string[],
  );
  let changed = false;

  const strip = (n: Node): Node => {
    if (n.kind !== "element" || n.repeat) return n;
    let next: ElementNode = n;
    if (n.bind?.source === "self") {
      const { bind: _drop, ...rest } = n;
      next = rest as ElementNode;
      changed = true;
    }
    if (next.children) {
      const kids = next.children.map(strip);
      if (kids.some((k, i) => k !== next.children![i])) {
        next = { ...next, children: kids };
      }
    }
    return next;
  };

  const visit = (n: Node): Node => {
    if (n.kind !== "element") return n;
    if (sources.has(n.id)) return strip(n);
    if (!n.children) return n;
    const kids = n.children.map(visit);
    return kids.some((k, i) => k !== n.children![i]) ? { ...n, children: kids } : n;
  };

  const root = visit(def.root) as ElementNode;
  return changed ? { ...def, root } : def;
}

/** Sync every custom block whose source layer still exists in the template. */
export function syncCustomBlocks<T extends TemplateDefinition>(input: T): T {
  const def = cleanCustomBlockSources(input);
  if (!def.customBlocks?.length || !def.root) return def;
  return {
    ...def,
    customBlocks: def.customBlocks.map((cb) => {
      // Library copies belong to another template's layers.
      if (cb.libraryId) return cb;
      const src = cb.sourceNodeId ? findById(def.root, cb.sourceNodeId) : null;
      return src ? syncCustomBlock(cb, src) : cb;
    }),
  };
}

/** The fields an end user may edit in the card editor. */
export function editableCustomBlockFields(
  block: TemplateCustomBlock,
): CustomBlockField[] {
  return (block.fields ?? []).filter((f) => f.editable !== false);
}

/**
 * The block layout with the card's content written into each child layer.
 * Fields with a `prop` are applied directly; older blocks (no `prop`) keep
 * relying on their `self` bindings. Non-editable fields always render the
 * template's default.
 */
export function applyCustomBlockContent(
  block: TemplateCustomBlock,
  content: Record<string, unknown> | undefined,
): Node {
  const layout = JSON.parse(JSON.stringify(block.layout)) as Node;
  const byNode = new Map<string, CustomBlockField[]>();
  for (const f of block.fields ?? []) {
    if (!f.prop) continue;
    const list = byNode.get(f.nodeId) ?? [];
    list.push(f);
    byNode.set(f.nodeId, list);
  }
  if (!byNode.size) return layout;

  const walk = (n: Node) => {
    const fs = byNode.get(n.id);
    if (fs && n.kind === "element") {
      const props = { ...((n.props ?? {}) as Record<string, unknown>) };
      for (const f of fs) {
        const userVal = f.editable === false ? undefined : content?.[f.key];
        const val = userVal !== undefined ? userVal : block.defaultContent?.[f.key];
        if (val !== undefined) props[f.prop!] = val;
      }
      n.props = props as ElementNode["props"];
    }
    if (n.kind === "element" && n.children) n.children.forEach(walk);
  };
  walk(layout);
  return layout;
}
