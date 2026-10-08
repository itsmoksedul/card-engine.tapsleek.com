"use strict";
/**
 * Definition validation — the gate the old system never had.
 *
 * `CardTemplate.definition` used to be `@IsObject()` and nothing more, so a
 * mis-shaped blueprint silently cloned broken data into real cards. Every
 * write now goes through this: structure, style whitelist, widget schemas,
 * uniqueness and hard caps, with a JSON path on every issue.
 *
 * Errors block the write. Warnings don't — they surface in the builder so an
 * admin can see dead part styles or an unreachable node before publishing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDefinition = validateDefinition;
exports.assertValidDefinition = assertValidDefinition;
exports.sanitizeTemplateDefinition = sanitizeTemplateDefinition;
const value_1 = require("../compile/value");
const definition_1 = require("../types/definition");
const node_1 = require("../types/node");
const registry_1 = require("../widgets/registry");
const schema_to_zod_1 = require("./schema-to-zod");
const style_1 = require("./style");
const ALL_TAGS = new Set([...node_1.CONTAINER_TAGS, ...node_1.VOID_TAGS]);
const CARD_FIELD_SET = new Set(node_1.CARD_FIELDS);
/** `on*` handlers and raw-HTML/document props never belong in a template. */
const UNSAFE_PROP_RE = /^(on[A-Za-z]|dangerouslySetInnerHTML$|innerHTML$|outerHTML$|srcdoc$|srcDoc$|formaction$|formAction$|style$)/;
/** Mirrors the renderer: what `props.as` may turn a frame into. */
const FRAME_AS_TAGS = new Set([
    "div", "section", "header", "footer", "nav", "main", "article", "aside",
    "figure", "ul", "ol", "li", "span", "a"
]);
const NODE_ACTIONS = new Set([
    "link",
    "vcard",
    "share",
    "qr",
    "popup",
    "scroll-to",
    "copy",
    "connect",
    "carousel-prev",
    "carousel-next",
    "carousel-dot",
]);
const POPUP_TRIGGERS = new Set(["onLoad", "afterDelay", "onExit", "manual"]);
function validateDefinition(input, options = {}) {
    const errors = [];
    const warnings = [];
    const stats = { nodes: 0, depth: 0, widgets: 0, slots: 0, bytes: 0 };
    const fail = (path, message) => errors.push({ path, message });
    const warn = (path, message) => warnings.push({ path, message });
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        fail("(root)", "definition must be an object");
        return { ok: false, errors, warnings, stats };
    }
    const def = input;
    // ── size ────────────────────────────────────────────────────────────────
    try {
        stats.bytes = (0, value_1.utf8Bytes)(JSON.stringify(def));
    }
    catch {
        fail("(root)", "definition is not serializable");
        return { ok: false, errors, warnings, stats };
    }
    if (stats.bytes > definition_1.DEFINITION_LIMITS.maxBytes) {
        fail("(root)", `definition too large (${stats.bytes} > ${definition_1.DEFINITION_LIMITS.maxBytes} bytes)`);
    }
    // ── schemaVersion / meta ────────────────────────────────────────────────
    if (def.schemaVersion !== definition_1.SCHEMA_VERSION) {
        fail("schemaVersion", `must be ${definition_1.SCHEMA_VERSION}`);
    }
    if (!def.meta || typeof def.meta !== "object") {
        fail("meta", "required");
    }
    else {
        if (!isNonEmptyString(def.meta.name, 120))
            fail("meta.name", "required, max 120 chars");
        const w = def.meta.canvasWidth;
        if (!Number.isFinite(w) || w < 280 || w > 1200) {
            fail("meta.canvasWidth", "must be a number between 280 and 1200");
        }
        if (def.meta.background !== undefined) {
            const bg = String(def.meta.background);
            if (!isTokenRefString(bg) && !value_1.VALUE_RE.color.test(bg)) {
                fail("meta.background", "must be a colour or a colour token");
            }
        }
    }
    // ── tokens ──────────────────────────────────────────────────────────────
    validateTokens(def, errors, warnings);
    // ── fonts ───────────────────────────────────────────────────────────────
    validateFonts(def.fonts, errors, warnings);
    // ── root tree ───────────────────────────────────────────────────────────
    const seenNodeIds = new Set();
    const seenKeys = new Set();
    if (!def.root || typeof def.root !== "object") {
        fail("root", "required");
    }
    else {
        if (!(0, node_1.isElement)(def.root) ||
            def.root.tag !== "frame") {
            fail("root", 'must be an element node with tag "frame"');
        }
        validateTree(def.root, "root", {
            errors,
            warnings,
            seenNodeIds,
            seenKeys,
            stats,
            options,
            tokens: def.tokens,
        });
    }
    // ── popups ──────────────────────────────────────────────────────────────
    validatePopups(def.popups, {
        errors,
        warnings,
        seenNodeIds,
        seenKeys,
        stats,
        options,
        tokens: def.tokens,
    });
    // ── settings ────────────────────────────────────────────────────────────
    if (def.settings?.allowTokenOverride) {
        if (!Array.isArray(def.settings.allowTokenOverride)) {
            fail("settings.allowTokenOverride", "must be an array");
        }
        else {
            const colours = new Set(Object.keys(def.tokens?.color ?? {}));
            for (const key of def.settings.allowTokenOverride) {
                if (!colours.has(String(key))) {
                    warn(`settings.allowTokenOverride.${String(key)}`, "not a colour token in this template — the override will do nothing");
                }
            }
        }
    }
    // ── global caps ─────────────────────────────────────────────────────────
    if (stats.nodes > definition_1.DEFINITION_LIMITS.maxNodes) {
        fail("(root)", `too many nodes (${stats.nodes} > ${definition_1.DEFINITION_LIMITS.maxNodes})`);
    }
    if (stats.depth > definition_1.DEFINITION_LIMITS.maxDepth) {
        fail("(root)", `tree too deep (${stats.depth} > ${definition_1.DEFINITION_LIMITS.maxDepth})`);
    }
    return { ok: errors.length === 0, errors, warnings, stats };
}
// ─── Tokens ──────────────────────────────────────────────────────────────────
function validateTokens(def, errors, warnings) {
    if (!def.tokens || typeof def.tokens !== "object") {
        errors.push({ path: "tokens", message: "required" });
        return;
    }
    for (const group of definition_1.TOKEN_GROUPS) {
        const table = def.tokens[group];
        if (table === undefined) {
            if (group === "color")
                errors.push({ path: "tokens.color", message: "required" });
            continue;
        }
        if (!table || typeof table !== "object" || Array.isArray(table)) {
            errors.push({ path: `tokens.${group}`, message: "must be an object" });
            continue;
        }
        const entries = Object.entries(table);
        if (entries.length > definition_1.DEFINITION_LIMITS.maxTokensPerGroup) {
            errors.push({
                path: `tokens.${group}`,
                message: `too many tokens (${entries.length} > ${definition_1.DEFINITION_LIMITS.maxTokensPerGroup})`,
            });
        }
        for (const [name, value] of entries) {
            const path = `tokens.${group}.${name}`;
            if (!value_1.IDENT_RE.test(name)) {
                errors.push({ path, message: "token name must be [A-Za-z0-9_-]" });
                continue;
            }
            if (typeof value !== "string" || !value.trim()) {
                errors.push({
                    path,
                    message: "token value must be a non-empty string",
                });
                continue;
            }
            if (!isValidTokenLiteral(group, value.trim())) {
                errors.push({ path, message: `invalid ${group} value "${value}"` });
            }
        }
    }
    if (!Object.keys(def.tokens.color ?? {}).length) {
        warnings.push({
            path: "tokens.color",
            message: "no colour tokens defined",
        });
    }
}
function isValidTokenLiteral(group, v) {
    switch (group) {
        case "color":
            return value_1.VALUE_RE.color.test(v);
        case "space":
        case "radius":
        case "size":
            return value_1.VALUE_RE.length.test(v);
        case "font":
            return value_1.VALUE_RE.fontFamily.test(v);
        case "shadow":
            return /^[a-z0-9\s.,()#%/-]+$/i.test(v) && !/[;{}@\\]/.test(v);
        default:
            return false;
    }
}
// ─── Fonts ───────────────────────────────────────────────────────────────────
function validateFonts(fonts, errors, warnings) {
    if (fonts === undefined)
        return;
    if (!Array.isArray(fonts)) {
        errors.push({ path: "fonts", message: "must be an array" });
        return;
    }
    if (fonts.length > definition_1.DEFINITION_LIMITS.maxFonts) {
        errors.push({
            path: "fonts",
            message: `too many fonts (max ${definition_1.DEFINITION_LIMITS.maxFonts})`,
        });
    }
    fonts.forEach((f, i) => {
        const p = `fonts[${i}]`;
        if (!f || typeof f !== "object") {
            errors.push({ path: p, message: "must be an object" });
            return;
        }
        if (!isNonEmptyString(f.family, 64) ||
            !value_1.VALUE_RE.fontFamily.test(f.family)) {
            errors.push({ path: `${p}.family`, message: "invalid font family" });
        }
        if (!Array.isArray(f.weights) || !f.weights.length) {
            errors.push({
                path: `${p}.weights`,
                message: "at least one weight required",
            });
        }
        else if (f.weights.some((w) => !Number.isInteger(w) || w < 100 || w > 900)) {
            errors.push({
                path: `${p}.weights`,
                message: "weights must be integers 100–900",
            });
        }
        if (f.source !== "self" && f.source !== "google") {
            errors.push({
                path: `${p}.source`,
                message: 'must be "self" or "google"',
            });
        }
        if (f.source === "self") {
            const files = f.files ?? {};
            const missing = (f.weights ?? []).filter((w) => !files[String(w)]);
            if (missing.length) {
                warnings.push({
                    path: `${p}.files`,
                    message: `no file for weight(s) ${missing.join(", ")} — those weights will not load`,
                });
            }
        }
    });
}
function validateTree(root, basePath, ctx) {
    ctx.stats.nodes += (0, node_1.countNodes)(root);
    ctx.stats.depth = Math.max(ctx.stats.depth, (0, node_1.maxDepth)(root));
    const pathOf = new Map();
    pathOf.set(root.id, basePath);
    (0, node_1.walkTreeOrder)(root, (node) => {
        const path = pathOf.get(node.id) ?? `${basePath}#${node.id}`;
        validateNode(node, path, ctx);
        if ((0, node_1.isElement)(node) && node.children) {
            node.children.forEach((child, i) => {
                if (child &&
                    typeof child === "object" &&
                    typeof child.id === "string") {
                    pathOf.set(child.id, `${path}.children[${i}]`);
                }
            });
        }
    });
}
function validateNode(node, path, ctx) {
    const { errors, warnings, seenNodeIds } = ctx;
    if (!node || typeof node !== "object") {
        errors.push({ path, message: "node must be an object" });
        return;
    }
    // id
    if (typeof node.id !== "string" ||
        !value_1.IDENT_RE.test(node.id) ||
        node.id.length > 64) {
        errors.push({
            path: `${path}.id`,
            message: "id must match [A-Za-z0-9_-] and be ≤ 64 chars",
        });
    }
    else if (seenNodeIds.has(node.id)) {
        errors.push({
            path: `${path}.id`,
            message: `duplicate node id "${node.id}"`,
        });
    }
    else {
        seenNodeIds.add(node.id);
    }
    // style
    const styleIssues = [];
    (0, style_1.validateStyleSet)(node.style, `${path}.style`, styleIssues);
    errors.push(...styleIssues);
    // hidden
    if (node.hidden !== undefined) {
        if (typeof node.hidden !== "object" || Array.isArray(node.hidden)) {
            errors.push({ path: `${path}.hidden`, message: "must be an object" });
        }
        else {
            for (const key of Object.keys(node.hidden)) {
                if (!["base", "sm", "md"].includes(key)) {
                    errors.push({
                        path: `${path}.hidden.${key}`,
                        message: "unknown breakpoint",
                    });
                }
            }
        }
    }
    switch (node.kind) {
        case "element":
            validateElement(node, path, ctx);
            break;
        case "widget":
            ctx.stats.widgets++;
            validateWidget(node, path, ctx);
            break;
        case "slot":
            ctx.stats.slots++;
            validateSlot(node, path, ctx);
            break;
        default:
            errors.push({
                path: `${path}.kind`,
                message: `unknown node kind "${String(node.kind)}"`,
            });
    }
    if (node.a11y && typeof node.a11y !== "object") {
        warnings.push({
            path: `${path}.a11y`,
            message: "ignored — must be an object",
        });
    }
}
function validateElement(node, path, ctx) {
    const { errors, warnings } = ctx;
    if (typeof node.tag !== "string" || !ALL_TAGS.has(node.tag)) {
        errors.push({
            path: `${path}.tag`,
            message: `unknown tag "${String(node.tag)}"`,
        });
        return;
    }
    const tag = node.tag;
    // children
    if (node.children !== undefined) {
        if (!Array.isArray(node.children)) {
            errors.push({ path: `${path}.children`, message: "must be an array" });
        }
        else if (!node_1.CONTAINER_TAGS.includes(tag) && node.children.length) {
            errors.push({
                path: `${path}.children`,
                message: `<${tag}> cannot have children`,
            });
        }
        else if (node.children.length > 100) {
            errors.push({
                path: `${path}.children`,
                message: "too many children (max 100)",
            });
        }
    }
    // props
    const props = (node.props ?? {});
    if (typeof props !== "object" || Array.isArray(props)) {
        errors.push({ path: `${path}.props`, message: "must be an object" });
        return;
    }
    // Raw-HTML / script vectors. The renderer only forwards an allowlist, but a
    // template carrying these is malformed or hostile — reject it loudly.
    for (const key of Object.keys(props)) {
        if (UNSAFE_PROP_RE.test(key)) {
            errors.push({
                path: `${path}.props.${key}`,
                message: `prop "${key}" is not allowed`,
            });
        }
    }
    if (props.as !== undefined && !FRAME_AS_TAGS.has(String(props.as))) {
        errors.push({
            path: `${path}.props.as`,
            message: `"${String(props.as)}" is not an allowed container tag`,
        });
    }
    if (tag === "heading") {
        const level = props.level;
        if (level !== undefined &&
            (!Number.isInteger(level) ||
                level < 1 ||
                level > 6)) {
            errors.push({ path: `${path}.props.level`, message: "must be 1–6" });
        }
    }
    if (tag === "image") {
        if (props.src !== undefined && !node.bind && !(0, value_1.safeUrl)(props.src)) {
            errors.push({
                path: `${path}.props.src`,
                message: "must be an https URL",
            });
        }
        if (!props.src && !node.bind) {
            warnings.push({
                path: `${path}.props.src`,
                message: "image has no source and no binding",
            });
        }
    }
    if (tag === "icon" && props.name !== undefined) {
        if (typeof props.name === "string" && !value_1.IDENT_RE.test(props.name)) {
            errors.push({ path: `${path}.props.name`, message: "invalid icon name" });
        }
    }
    if (tag === "button" || tag === "link") {
        const action = props.action;
        if (action !== undefined && !NODE_ACTIONS.has(String(action))) {
            errors.push({
                path: `${path}.props.action`,
                message: `unknown action "${String(action)}"`,
            });
        }
        if ((action === undefined || action === "link") &&
            props.href !== undefined) {
            const href = String(props.href);
            if (!/^(https?:\/\/|mailto:|tel:|sms:|#|\/)/i.test(href)) {
                errors.push({
                    path: `${path}.props.href`,
                    message: "unsupported URL scheme",
                });
            }
        }
        if (action === "popup" && !isNonEmptyString(props.popup, 64)) {
            errors.push({
                path: `${path}.props.popup`,
                message: "popup action needs a popup key",
            });
        }
    }
    if ((tag === "heading" || tag === "text") && props.text !== undefined) {
        if (typeof props.text !== "string" || props.text.length > 2000) {
            errors.push({
                path: `${path}.props.text`,
                message: "must be a string ≤ 2000 chars",
            });
        }
    }
    if (tag === "richtext" &&
        props.html !== undefined &&
        typeof props.html !== "string") {
        errors.push({ path: `${path}.props.html`, message: "must be a string" });
    }
    // binding
    if (node.bind !== undefined)
        validateBinding(node.bind, `${path}.bind`, ctx);
    if (node.hideIfEmpty !== undefined && typeof node.hideIfEmpty !== "boolean") {
        errors.push({ path: `${path}.hideIfEmpty`, message: "must be a boolean" });
    }
    if (node.hideIfEmpty && !node.bind) {
        warnings.push({
            path: `${path}.hideIfEmpty`,
            message: "has no effect without a binding",
        });
    }
}
function validateBinding(bind, path, ctx) {
    const { errors } = ctx;
    if (!bind || typeof bind !== "object") {
        errors.push({ path, message: "must be an object" });
        return;
    }
    switch (bind.source) {
        case "card":
            if (!CARD_FIELD_SET.has(bind.field)) {
                errors.push({
                    path: `${path}.field`,
                    message: `unknown card field "${String(bind.field)}"`,
                });
            }
            break;
        case "widget":
            if (!isNonEmptyString(bind.key, 64))
                errors.push({ path: `${path}.key`, message: "required" });
            if (!isNonEmptyString(bind.path, 128))
                errors.push({ path: `${path}.path`, message: "required" });
            break;
        case "token":
            if (!isNonEmptyString(bind.path, 64))
                errors.push({ path: `${path}.path`, message: "required" });
            break;
        case "self":
            if (!isNonEmptyString(bind.path, 128))
                errors.push({ path: `${path}.path`, message: "required" });
            if (bind.format !== undefined &&
                !node_1.BINDING_FORMATS.includes(bind.format)) {
                errors.push({
                    path: `${path}.format`,
                    message: `unknown format "${String(bind.format)}"`,
                });
            }
            break;
        default:
            errors.push({
                path: `${path}.source`,
                message: 'must be "card", "widget", "token", or "self"',
            });
    }
}
function validateWidget(node, path, ctx) {
    const { errors, warnings, seenKeys, options } = ctx;
    if (!isNonEmptyString(node.widget, 64) || !(0, registry_1.hasWidget)(node.widget)) {
        errors.push({
            path: `${path}.widget`,
            message: `unknown widget type "${String(node.widget)}"`,
        });
        return;
    }
    const meta = (0, registry_1.getWidgetMeta)(node.widget);
    if (meta.deprecated) {
        warnings.push({
            path: `${path}.widget`,
            message: `"${node.widget}" is deprecated since ${meta.deprecated.since}${meta.deprecated.replacedBy ? ` — use ${meta.deprecated.replacedBy}` : ""}`,
        });
    }
    // key
    if (typeof node.key !== "string" ||
        !value_1.IDENT_RE.test(node.key) ||
        node.key.length > 64) {
        errors.push({
            path: `${path}.key`,
            message: "key must match [A-Za-z0-9_-] and be ≤ 64 chars",
        });
    }
    else if (seenKeys.has(node.key)) {
        errors.push({
            path: `${path}.key`,
            message: `duplicate content key "${node.key}"`,
        });
    }
    else {
        seenKeys.add(node.key);
    }
    if (!isNonEmptyString(node.label, 80)) {
        errors.push({ path: `${path}.label`, message: "required, max 80 chars" });
    }
    if (node.role !== undefined && !value_1.IDENT_RE.test(String(node.role))) {
        errors.push({
            path: `${path}.role`,
            message: "role must match [A-Za-z0-9_-]",
        });
    }
    // partStyles must reference real parts, else the CSS is dead weight
    if (node.partStyles !== undefined) {
        if (typeof node.partStyles !== "object" || Array.isArray(node.partStyles)) {
            errors.push({ path: `${path}.partStyles`, message: "must be an object" });
        }
        else {
            const known = new Set((meta.parts ?? []).map((p) => p.key));
            for (const [part, set] of Object.entries(node.partStyles)) {
                const p = `${path}.partStyles.${part}`;
                if (!known.has(part)) {
                    warnings.push({
                        path: p,
                        message: `"${node.widget}" has no part "${part}" — this CSS is dead`,
                    });
                    continue;
                }
                const styleIssues = [];
                (0, style_1.validateStyleSet)(set, p, styleIssues);
                errors.push(...styleIssues);
            }
        }
    }
    if (options.shallow)
        return;
    // design must satisfy the widget's designSchema
    if (node.design !== undefined) {
        const res = (0, schema_to_zod_1.validateAgainstSchema)(meta.designSchema ?? [], node.design, {
            imageHosts: options.imageHosts,
        });
        for (const issue of res.issues) {
            errors.push({
                path: `${path}.design.${issue.path}`,
                message: issue.message,
            });
        }
    }
    // userOptions must name real design keys
    if (node.userOptions !== undefined) {
        if (!Array.isArray(node.userOptions)) {
            errors.push({ path: `${path}.userOptions`, message: "must be an array" });
        }
        else {
            const designKeys = new Set((meta.designSchema ?? []).map((f) => f.key));
            for (const key of node.userOptions) {
                if (!designKeys.has(String(key))) {
                    errors.push({
                        path: `${path}.userOptions`,
                        message: `"${String(key)}" is not a design option of ${node.widget}`,
                    });
                }
            }
        }
    }
    // defaultContent must satisfy the widget's contentSchema
    if (meta.derived) {
        if (node.defaultContent && Object.keys(node.defaultContent).length) {
            warnings.push({
                path: `${path}.defaultContent`,
                message: `${node.widget} is derived from card data — defaultContent is ignored`,
            });
        }
    }
    else if (node.defaultContent !== undefined) {
        const res = (0, schema_to_zod_1.validateAgainstSchema)(meta.contentSchema, node.defaultContent, {
            imageHosts: options.imageHosts,
            partial: true,
        });
        for (const issue of res.issues) {
            errors.push({
                path: `${path}.defaultContent.${issue.path}`,
                message: issue.message,
            });
        }
    }
    else {
        warnings.push({
            path: `${path}.defaultContent`,
            message: "no demo content — the widget will look empty until the user fills it in",
        });
    }
    if (node.editable === false && node.userCanHide) {
        warnings.push({
            path: `${path}.userCanHide`,
            message: "has no effect on a non-editable widget",
        });
    }
    // layout
    if (node.layout !== undefined) {
        if (!(0, node_1.isElement)(node.layout)) {
            errors.push({
                path: `${path}.layout`,
                message: "must be an element node",
            });
        }
        else {
            // Layout node ids only need to be unique WITHIN the widget's own subtree.
            // The compiler scopes every layout node under its widget
            // (`.n<widget> .n<layoutNode>`), so the same id (e.g. "root", "icon",
            // "label") may legitimately appear in another widget's layout or match
            // the template's own root id. Validate the subtree with a fresh id set
            // instead of the global one, while still accumulating errors/warnings/
            // stats into the shared context.
            validateTree(node.layout, `${path}.layout`, {
                ...ctx,
                seenNodeIds: new Set(),
            });
        }
    }
}
function validateSlot(node, path, ctx) {
    const { errors, warnings, seenKeys } = ctx;
    if (typeof node.key !== "string" || !value_1.IDENT_RE.test(node.key)) {
        errors.push({
            path: `${path}.key`,
            message: "key must match [A-Za-z0-9_-]",
        });
    }
    else if (seenKeys.has(node.key)) {
        errors.push({
            path: `${path}.key`,
            message: `duplicate content key "${node.key}"`,
        });
    }
    else {
        seenKeys.add(node.key);
    }
    if (!isNonEmptyString(node.label, 80)) {
        errors.push({ path: `${path}.label`, message: "required" });
    }
    if (!Array.isArray(node.allow) || !node.allow.length) {
        errors.push({
            path: `${path}.allow`,
            message: "at least one widget type required",
        });
    }
    else {
        for (const type of node.allow) {
            if (!(0, registry_1.hasWidget)(String(type))) {
                errors.push({
                    path: `${path}.allow`,
                    message: `unknown widget type "${String(type)}"`,
                });
            }
            else if ((0, registry_1.getWidgetMeta)(String(type)).derived) {
                errors.push({
                    path: `${path}.allow`,
                    message: `"${String(type)}" is derived from card data and cannot be user-added`,
                });
            }
        }
    }
    if (node.max !== undefined &&
        (!Number.isInteger(node.max) || node.max < 1 || node.max > 20)) {
        errors.push({ path: `${path}.max`, message: "must be an integer 1–20" });
    }
    if (node.presets !== undefined) {
        if (typeof node.presets !== "object" || Array.isArray(node.presets)) {
            errors.push({ path: `${path}.presets`, message: "must be an object" });
        }
        else {
            for (const [type, preset] of Object.entries(node.presets)) {
                const p = `${path}.presets.${type}`;
                if (!(0, registry_1.hasWidget)(type)) {
                    warnings.push({
                        path: p,
                        message: `unknown widget type "${type}" — preset ignored`,
                    });
                    continue;
                }
                if (!node.allow?.includes(type)) {
                    warnings.push({
                        path: p,
                        message: `"${type}" is not in this slot's allow list`,
                    });
                }
                const known = new Set(((0, registry_1.getWidgetMeta)(type).parts ?? []).map((x) => x.key));
                for (const [part, set] of Object.entries(preset?.partStyles ?? {})) {
                    if (!known.has(part)) {
                        warnings.push({
                            path: `${p}.partStyles.${part}`,
                            message: "unknown part — dead CSS",
                        });
                        continue;
                    }
                    const styleIssues = [];
                    (0, style_1.validateStyleSet)(set, `${p}.partStyles.${part}`, styleIssues);
                    errors.push(...styleIssues);
                }
            }
        }
    }
}
// ─── Popups ──────────────────────────────────────────────────────────────────
function validatePopups(popups, ctx) {
    if (popups === undefined)
        return;
    const { errors } = ctx;
    if (!Array.isArray(popups)) {
        errors.push({ path: "popups", message: "must be an array" });
        return;
    }
    if (popups.length > definition_1.DEFINITION_LIMITS.maxPopups) {
        errors.push({
            path: "popups",
            message: `too many popups (max ${definition_1.DEFINITION_LIMITS.maxPopups})`,
        });
    }
    const keys = new Set();
    popups.forEach((popup, i) => {
        const path = `popups[${i}]`;
        if (!popup || typeof popup !== "object") {
            errors.push({ path, message: "must be an object" });
            return;
        }
        if (!isNonEmptyString(popup.key, 64) || !value_1.IDENT_RE.test(popup.key)) {
            errors.push({
                path: `${path}.key`,
                message: "key must match [A-Za-z0-9_-]",
            });
        }
        else if (keys.has(popup.key)) {
            errors.push({
                path: `${path}.key`,
                message: `duplicate popup key "${popup.key}"`,
            });
        }
        else {
            keys.add(popup.key);
        }
        if (!isNonEmptyString(popup.label, 80))
            errors.push({ path: `${path}.label`, message: "required" });
        if (!POPUP_TRIGGERS.has(String(popup.trigger))) {
            errors.push({
                path: `${path}.trigger`,
                message: "must be onLoad | afterDelay | onExit | manual",
            });
        }
        if (popup.trigger === "afterDelay") {
            const d = popup.delaySeconds;
            if (!Number.isFinite(d) || d < 0 || d > 600) {
                errors.push({
                    path: `${path}.delaySeconds`,
                    message: "must be 0–600 seconds",
                });
            }
        }
        const styleIssues = [];
        (0, style_1.validateStyleSet)(popup.backdrop, `${path}.backdrop`, styleIssues);
        (0, style_1.validateStyleSet)(popup.panel, `${path}.panel`, styleIssues);
        errors.push(...styleIssues);
        if (!popup.root || typeof popup.root !== "object") {
            errors.push({ path: `${path}.root`, message: "required" });
        }
        else {
            validateTree(popup.root, `${path}.root`, ctx);
        }
    });
}
// ─── Utils ───────────────────────────────────────────────────────────────────
function isNonEmptyString(v, max) {
    return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}
function isTokenRefString(v) {
    return /^\{(color|space|radius|font|size|shadow)\.[A-Za-z0-9_-]+\}$/.test(v);
}
/** Throwable wrapper for call sites that want an exception. */
function assertValidDefinition(input, options) {
    const result = validateDefinition(input, options);
    if (!result.ok) {
        const detail = result.errors
            .slice(0, 10)
            .map((e) => `${e.path}: ${e.message}`)
            .join("; ");
        throw new Error(`Invalid template definition (${result.errors.length} error${result.errors.length === 1 ? "" : "s"}): ${detail}`);
    }
    return input;
}
/** Automatically sanitizes template definition for valid save & publish. */
function sanitizeTemplateDefinition(input) {
    if (!input || typeof input !== "object")
        return input;
    const cloned = structuredClone(input);
    function isUnallowedImage(url) {
        if (typeof url !== "string" || !url.startsWith("http"))
            return false;
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            if (hostname.includes("tapsleek") ||
                hostname.includes("r2.") ||
                hostname.includes("localhost")) {
                return false;
            }
            return true;
        }
        catch {
            return false;
        }
    }
    function sanitizeObj(obj) {
        if (!obj || typeof obj !== "object")
            return;
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === "string" && isUnallowedImage(val)) {
                obj[key] = "";
            }
            else if (Array.isArray(val)) {
                val.forEach((item) => sanitizeObj(item));
            }
            else if (val && typeof val === "object") {
                sanitizeObj(val);
            }
        }
    }
    function deduplicateSubtreeIds(rootNode) {
        if (!rootNode || typeof rootNode !== "object")
            return;
        const idCounts = new Map();
        function count(node) {
            if (!node || typeof node !== "object")
                return;
            if (typeof node.id === "string") {
                idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1);
            }
            // Do not traverse into widget layout here, as layout has its own scope
            if (Array.isArray(node.children)) {
                node.children.forEach(count);
            }
        }
        count(rootNode);
        const seenIds = new Set();
        function makeUnique(base) {
            let candidate = base;
            let counter = 1;
            while (seenIds.has(candidate) || idCounts.has(candidate)) {
                candidate = `${base}_${counter++}`;
            }
            return candidate;
        }
        function resolve(node) {
            if (!node || typeof node !== "object")
                return;
            if (typeof node.id === "string") {
                const countForId = idCounts.get(node.id) || 0;
                const isDupe = countForId > 1;
                const isContainer = node.kind === "element" &&
                    (node.tag === "frame" || node.tag === "grid");
                if (seenIds.has(node.id) || (isDupe && isContainer)) {
                    const prefix = isContainer ? node.tag || "frame" : node.id;
                    const newId = makeUnique(prefix);
                    node.id = newId;
                    seenIds.add(newId);
                }
                else {
                    seenIds.add(node.id);
                }
            }
            if (Array.isArray(node.children)) {
                node.children.forEach(resolve);
            }
        }
        resolve(rootNode);
    }
    function cleanStyle(style) {
        if (!style || typeof style !== "object")
            return style;
        for (const layerKey of ["base", "sm", "md", "hover", "active", "focus"]) {
            const layer = style[layerKey];
            if (!layer || typeof layer !== "object")
                continue;
            if (layer.background !== undefined && layer.background !== null && layer.background !== "") {
                if (typeof layer.background === "string") {
                    layer.background = { kind: "color", color: layer.background };
                }
                else if (typeof layer.background === "object") {
                    if (layer.background.kind === "color") {
                        if (!layer.background.color || layer.background.color === "") {
                            delete layer.background;
                        }
                    }
                    else if (layer.background.kind === "gradient") {
                        if (!Array.isArray(layer.background.stops) || layer.background.stops.length < 2) {
                            delete layer.background;
                        }
                    }
                    else if (layer.background.kind === "image") {
                        if (!layer.background.url || typeof layer.background.url !== "string") {
                            delete layer.background;
                        }
                    }
                    else {
                        delete layer.background;
                    }
                }
                else {
                    delete layer.background;
                }
            }
        }
        return (0, style_1.sanitizeStyleSet)(style);
    }
    function walkNode(node) {
        if (!node || typeof node !== "object")
            return;
        // 0. Sanitize node style & widget partStyles
        if (node.style) {
            node.style = cleanStyle(node.style) ?? {};
        }
        if (node.partStyles && typeof node.partStyles === "object") {
            for (const [k, v] of Object.entries(node.partStyles)) {
                if (v && typeof v === "object") {
                    node.partStyles[k] = cleanStyle(v) ?? {};
                }
            }
        }
        // 1. Fix <button> with children -> convert tag to <link>
        if (node.kind === "element" &&
            node.tag === "button" &&
            Array.isArray(node.children) &&
            node.children.length > 0) {
            node.tag = "link";
        }
        // 2. Clean widget defaultContent image URLs
        if (node.kind === "widget" && node.defaultContent) {
            sanitizeObj(node.defaultContent);
        }
        // 3. Clean widget layout if present
        if (node.layout) {
            deduplicateSubtreeIds(node.layout);
            walkNode(node.layout);
        }
        // 4. Walk children
        if (Array.isArray(node.children)) {
            node.children.forEach(walkNode);
        }
    }
    function deduplicateContentKeys(def) {
        if (!def || typeof def !== "object")
            return;
        const seenKeys = new Set();
        function makeUniqueKey(base) {
            const slug = base
                .toLowerCase()
                .replace(/[^a-z0-9_-]+/g, "_")
                .replace(/^_+|_+$/g, "") || "widget";
            if (!seenKeys.has(slug))
                return slug;
            for (let i = 2; i < 5000; i++) {
                const candidate = `${slug}_${i}`;
                if (!seenKeys.has(candidate))
                    return candidate;
            }
            return `${slug}_${Date.now().toString(36)}`;
        }
        function walk(node) {
            if (!node || typeof node !== "object")
                return;
            if ((node.kind === "widget" || node.kind === "slot") &&
                typeof node.key === "string") {
                if (seenKeys.has(node.key)) {
                    const freshKey = makeUniqueKey(node.key);
                    node.key = freshKey;
                    seenKeys.add(freshKey);
                }
                else {
                    seenKeys.add(node.key);
                }
            }
            if (Array.isArray(node.children)) {
                node.children.forEach(walk);
            }
        }
        if (def.root)
            walk(def.root);
        if (Array.isArray(def.popups)) {
            def.popups.forEach((p) => p && p.root && walk(p.root));
        }
    }
    if (cloned.root) {
        deduplicateSubtreeIds(cloned.root);
        walkNode(cloned.root);
        deduplicateContentKeys(cloned);
    }
    if (Array.isArray(cloned.customBlocks)) {
        cloned.customBlocks.forEach((cb) => {
            if (cb && cb.node) {
                walkNode(cb.node);
            }
        });
    }
    return cloned;
}
