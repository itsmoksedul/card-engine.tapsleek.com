"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFieldsFromNode = extractFieldsFromNode;
exports.createCustomBlockFromNode = createCustomBlockFromNode;
exports.syncCustomBlock = syncCustomBlock;
exports.syncCustomBlocks = syncCustomBlocks;
exports.editableCustomBlockFields = editableCustomBlockFields;
exports.applyCustomBlockContent = applyCustomBlockContent;
function slugify(text) {
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
function cloneAndScopeTree(node, prefix) {
    const cloned = JSON.parse(JSON.stringify(node));
    function walk(n) {
        if (!n || typeof n !== "object")
            return;
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
function fieldId(nodeId, prop) {
    return `${nodeId}:${prop ?? ""}`;
}
/** Turn an inner widget node into a plain element in place. */
function toElement(n, tag, props) {
    const el = n;
    el.kind = "element";
    el.tag = tag;
    if (props)
        el.props = props;
    delete el.widget;
    delete el.key;
    delete el.label;
    delete el.defaultContent;
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
function extractFieldsFromNode(rootNode, previous = []) {
    const layout = JSON.parse(JSON.stringify(rootNode));
    const fields = [];
    const defaultContent = {};
    const prevById = new Map(previous.map((f) => [fieldId(f.nodeId, f.prop), f]));
    const seenKeys = new Set(previous.map((f) => f.key));
    const usedKeys = new Set();
    function uniqueKey(base) {
        let key = base;
        let idx = 1;
        while (seenKeys.has(key)) {
            idx++;
            key = `${base}_${idx}`;
        }
        seenKeys.add(key);
        return key;
    }
    function add(nodeId, prop, base, label, type, value) {
        const prev = prevById.get(fieldId(nodeId, prop)) ??
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
    const str = (v, fallback = "") => v ?? fallback;
    function walk(n) {
        if (n.kind === "element") {
            // Bindings to card data stay live — they are not template content.
            if (n.bind?.source === "self")
                delete n.bind;
            const cardBound = Boolean(n.bind);
            const tag = n.tag;
            const named = n.name && n.name !== n.id ? n.name : null;
            const props = (n.props ?? {});
            const isSystemAction = typeof props.action === "string" && props.action.startsWith("carousel-");
            if (!cardBound && !isSystemAction) {
                if (tag === "heading") {
                    add(n.id, "text", "title", named ?? "Heading", "text", str(props.text ?? props.content, ""));
                }
                else if (tag === "text") {
                    add(n.id, "text", "description", named ?? "Text", "textarea", str(props.text ?? props.content, ""));
                }
                else if (tag === "richtext") {
                    add(n.id, "html", "description", named ?? "Rich Text", "richtext", str(props.html, ""));
                }
                else if (tag === "image") {
                    add(n.id, "src", "imageUrl", named ?? "Image", "image", str(props.src, ""));
                }
                else if (tag === "icon") {
                    add(n.id, "name", "icon", named ?? "Icon", "icon", str(props.name, ""));
                }
                else if (tag === "video") {
                    add(n.id, "url", "videoUrl", named ?? "Video", "video", str(props.url, ""));
                }
                else if (tag === "button") {
                    add(n.id, "label", "buttonText", named ? `${named} Label` : "Button Label", "text", str(props.label ?? props.text, ""));
                }
                const linkLike = tag === "button" || tag === "link" || (tag === "frame" && props.as === "a");
                if (linkLike && (!props.action || props.action === "link")) {
                    add(n.id, "href", "buttonUrl", named ? `${named} Link` : tag === "button" ? "Button Link" : "Link URL", "url", str(props.href ?? props.url, ""));
                }
            }
            if (Array.isArray(n.children))
                n.children.forEach(walk);
            return;
        }
        if (n.kind === "widget") {
            const widgetType = (n.widget || "").toUpperCase();
            const label = n.label || n.name || widgetType;
            const def = (n.defaultContent || {});
            if (widgetType === "VIDEO") {
                const url = str(def.url, "");
                toElement(n, "video", { url });
                add(n.id, "url", "videoUrl", `${label} URL`, "video", url);
            }
            else if (widgetType === "TITLE" || widgetType === "HEADING") {
                const text = str(def.text, "");
                toElement(n, "heading", { text, level: def.level ?? 2 });
                add(n.id, "text", "title", `${label} Text`, "text", text);
            }
            else if (widgetType === "RICH_TEXT") {
                const html = str(def.text ?? def.html, "");
                toElement(n, "richtext", { html });
                add(n.id, "html", "description", `${label} Text`, "richtext", html);
            }
            else if (widgetType === "DESCRIPTION" || widgetType === "TEXT") {
                const text = str(def.text, "");
                toElement(n, "text", { text });
                add(n.id, "text", "description", `${label} Text`, "textarea", text);
            }
            else if (widgetType === "MAP" || widgetType === "MAPS") {
                const text = str(def.address, "");
                const el = toElement(n, "text", { text });
                const key = add(n.id, "text", "address", `${label} Address`, "text", text);
                // The address formatter only runs on bound values.
                el.bind = { source: "self", path: key, format: "mapAddress" };
            }
            else if (widgetType === "IMAGE" || widgetType === "AVATAR" || widgetType === "LOGO") {
                const src = str(def.url ?? def.src, "");
                toElement(n, "image", { src });
                add(n.id, "src", "imageUrl", `${label} Image`, "image", src);
            }
            else if (widgetType === "ICON") {
                const name = str(def.name, "Star");
                toElement(n, "icon", { name });
                add(n.id, "name", "icon", `${label} Icon`, "icon", name);
            }
            else if (widgetType === "DIVIDER") {
                toElement(n, "divider");
            }
            else if (widgetType === "SPACER") {
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
function createCustomBlockFromNode(node, label, icon = "Layout", description) {
    const safeIdBase = slugify(label) || "block";
    const blockId = `block_${safeIdBase}_${Math.random().toString(36).slice(2, 6)}`;
    const { fields, defaultContent, layout } = extractFieldsFromNode(cloneAndScopeTree(node, blockId));
    return {
        id: blockId,
        label: label.trim() || "Custom Block",
        icon: icon || "Layout",
        description: description ||
            `Custom block based on ${node.name || node.label || "group"}`,
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
function syncCustomBlock(block, sourceNode) {
    const { fields, defaultContent, layout } = extractFieldsFromNode(cloneAndScopeTree(sourceNode, block.id), block.fields ?? []);
    return { ...block, layout, fields, defaultContent };
}
function findById(root, id) {
    if (root.id === id)
        return root;
    if (root.kind === "element" && root.children) {
        for (const c of root.children) {
            const hit = findById(c, id);
            if (hit)
                return hit;
        }
    }
    return null;
}
/** Sync every custom block whose source layer still exists in the template. */
function syncCustomBlocks(def) {
    if (!def.customBlocks?.length || !def.root)
        return def;
    return {
        ...def,
        customBlocks: def.customBlocks.map((cb) => {
            const src = cb.sourceNodeId ? findById(def.root, cb.sourceNodeId) : null;
            return src ? syncCustomBlock(cb, src) : cb;
        }),
    };
}
/** The fields an end user may edit in the card editor. */
function editableCustomBlockFields(block) {
    return (block.fields ?? []).filter((f) => f.editable !== false);
}
/**
 * The block layout with the card's content written into each child layer.
 * Fields with a `prop` are applied directly; older blocks (no `prop`) keep
 * relying on their `self` bindings. Non-editable fields always render the
 * template's default.
 */
function applyCustomBlockContent(block, content) {
    const layout = JSON.parse(JSON.stringify(block.layout));
    const byNode = new Map();
    for (const f of block.fields ?? []) {
        if (!f.prop)
            continue;
        const list = byNode.get(f.nodeId) ?? [];
        list.push(f);
        byNode.set(f.nodeId, list);
    }
    if (!byNode.size)
        return layout;
    const walk = (n) => {
        const fs = byNode.get(n.id);
        if (fs && n.kind === "element") {
            const props = { ...(n.props ?? {}) };
            for (const f of fs) {
                const userVal = f.editable === false ? undefined : content?.[f.key];
                const val = userVal !== undefined ? userVal : block.defaultContent?.[f.key];
                if (val !== undefined)
                    props[f.prop] = val;
            }
            n.props = props;
        }
        if (n.kind === "element" && n.children)
            n.children.forEach(walk);
    };
    walk(layout);
    return layout;
}
