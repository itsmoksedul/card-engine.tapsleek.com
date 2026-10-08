"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFieldsFromNode = extractFieldsFromNode;
exports.createCustomBlockFromNode = createCustomBlockFromNode;
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
/**
 * Inspects an ElementNode (e.g. a Frame/Group) and discovers all editable
 * content fields (headings, texts, images, videos, buttons, and inner widgets).
 */
function extractFieldsFromNode(rootNode) {
    const fields = [];
    const defaultContent = {};
    const seenKeys = new Set();
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
    function walk(n) {
        if (n.kind === "element") {
            const tag = n.tag;
            const label = n.name || n.id;
            if (tag === "heading") {
                const k = uniqueKey("title");
                const textVal = String(n.props?.text ?? n.props?.content ?? "Heading");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: label !== n.id ? label : "Heading Text",
                    type: "text",
                    default: textVal,
                });
                defaultContent[k] = textVal;
                // Bind node to this self key
                n.bind = { source: "self", path: k };
            }
            else if (tag === "text" || tag === "richtext") {
                const k = uniqueKey("description");
                const textVal = String(n.props?.text ?? n.props?.content ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: label !== n.id ? label : "Text / Description",
                    type: "textarea",
                    default: textVal,
                });
                defaultContent[k] = textVal;
                n.bind = { source: "self", path: k };
            }
            else if (tag === "video") {
                const k = uniqueKey("videoUrl");
                const urlVal = String(n.props?.url ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: label !== n.id ? label : "Video URL",
                    type: "video",
                    default: urlVal,
                });
                defaultContent[k] = urlVal;
                n.bind = { source: "self", path: k };
            }
            else if (tag === "image") {
                const k = uniqueKey("imageUrl");
                const srcVal = String(n.props?.src ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: label !== n.id ? label : "Image URL",
                    type: "image",
                    default: srcVal,
                });
                defaultContent[k] = srcVal;
                n.bind = { source: "self", path: k };
            }
            else if (tag === "button" || tag === "link" || (tag === "frame" && n.props?.as === "a")) {
                if ((tag === "button" || tag === "link") && (n.props?.text || n.props?.label)) {
                    const kLabel = uniqueKey("buttonText");
                    const btnLabel = String(n.props?.label ?? n.props?.text ?? "Click here");
                    fields.push({
                        nodeId: n.id,
                        key: kLabel,
                        label: `${label} Label`,
                        type: "text",
                        default: btnLabel,
                    });
                    defaultContent[kLabel] = btnLabel;
                    n.bind = { source: "self", path: kLabel };
                }
                if (n.props?.url || n.props?.href || tag === "frame") {
                    const kUrl = uniqueKey("buttonUrl");
                    const btnUrl = String(n.props?.url ?? n.props?.href ?? "");
                    fields.push({
                        nodeId: n.id,
                        key: kUrl,
                        label: tag === "frame" ? `${label} Link` : `${label} URL`,
                        type: "url",
                        default: btnUrl,
                    });
                    defaultContent[kUrl] = btnUrl;
                    if (tag === "frame") {
                        n.bind = { source: "self", path: kUrl };
                    }
                }
            }
            if (Array.isArray(n.children)) {
                n.children.forEach(walk);
            }
        }
        else if (n.kind === "widget") {
            const widgetType = (n.widget || "").toUpperCase();
            const label = n.label || n.name || widgetType;
            const defContent = (n.defaultContent || {});
            if (widgetType === "VIDEO") {
                const k = uniqueKey("videoUrl");
                const urlVal = String(defContent.url ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: `${label} URL`,
                    type: "video",
                    default: urlVal,
                });
                defaultContent[k] = urlVal;
                const el = n;
                el.kind = "element";
                el.tag = "video";
                el.props = { url: urlVal };
                el.bind = { source: "self", path: k };
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "TITLE" || widgetType === "HEADING") {
                const k = uniqueKey("title");
                const textVal = String(defContent.text ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: `${label} Text`,
                    type: "text",
                    default: textVal,
                });
                defaultContent[k] = textVal;
                const el = n;
                el.kind = "element";
                el.tag = "heading";
                el.props = { text: textVal, level: defContent.level ?? 2 };
                el.bind = { source: "self", path: k };
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "DESCRIPTION" || widgetType === "RICH_TEXT" || widgetType === "TEXT") {
                const k = uniqueKey("description");
                const textVal = String(defContent.text ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: `${label} Text`,
                    type: "textarea",
                    default: textVal,
                });
                defaultContent[k] = textVal;
                const el = n;
                el.kind = "element";
                el.tag = widgetType === "RICH_TEXT" ? "richtext" : "text";
                el.props = widgetType === "RICH_TEXT" ? { html: textVal } : { text: textVal };
                el.bind = { source: "self", path: k };
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "MAP" || widgetType === "MAPS") {
                const k = uniqueKey("address");
                const addrVal = String(defContent.address ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: `${label} Address`,
                    type: "text",
                    default: addrVal,
                });
                defaultContent[k] = addrVal;
                const el = n;
                el.kind = "element";
                el.tag = "text";
                el.props = { text: addrVal };
                el.bind = { source: "self", path: k, format: "mapAddress" };
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "IMAGE" || widgetType === "AVATAR" || widgetType === "LOGO") {
                const k = uniqueKey("imageUrl");
                const srcVal = String(defContent.url ?? defContent.src ?? "");
                fields.push({
                    nodeId: n.id,
                    key: k,
                    label: `${label} Image`,
                    type: "image",
                    default: srcVal,
                });
                defaultContent[k] = srcVal;
                const el = n;
                el.kind = "element";
                el.tag = "image";
                el.props = { src: srcVal };
                el.bind = { source: "self", path: k };
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "ICON") {
                const el = n;
                el.kind = "element";
                el.tag = "icon";
                el.props = { name: defContent.name ?? "Star" };
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "DIVIDER") {
                const el = n;
                el.kind = "element";
                el.tag = "divider";
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
            else if (widgetType === "SPACER") {
                const el = n;
                el.kind = "element";
                el.tag = "spacer";
                delete el.widget;
                delete el.key;
                delete el.label;
                delete el.defaultContent;
            }
        }
    }
    walk(rootNode);
    return { fields, defaultContent };
}
/**
 * Creates a TemplateCustomBlock from a selected Frame/Container node.
 */
function createCustomBlockFromNode(node, label, icon = "Layout", description) {
    const safeIdBase = slugify(label) || "block";
    const blockId = `block_${safeIdBase}_${Math.random().toString(36).slice(2, 6)}`;
    // Clone node tree and ensure IDs are scoped to this block
    const cloned = cloneAndScopeTree(node, blockId);
    // Discover fields and bind editable leaves to self keys
    const { fields, defaultContent } = extractFieldsFromNode(cloned);
    return {
        id: blockId,
        label: label.trim() || "Custom Block",
        icon: icon || "Layout",
        description: description ||
            `Custom block based on ${node.name || node.label || "group"}`,
        sourceNodeId: node.id,
        layout: cloned,
        fields,
        defaultContent,
    };
}
