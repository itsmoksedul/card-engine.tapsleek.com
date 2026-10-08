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

import { IDENT_RE, safeUrl, utf8Bytes, VALUE_RE } from "../compile/value";
import {
  DEFINITION_LIMITS,
  SCHEMA_VERSION,
  TOKEN_GROUPS,
  type FontSpec,
  type PopupDef,
  type TemplateDefinition,
  type TokenGroup,
} from "../types/definition";
import {
  BINDING_FORMATS,
  CARD_FIELDS,
  CONTAINER_TAGS,
  countNodes,
  isElement,
  maxDepth,
  VOID_TAGS,
  walkTreeOrder,
  type Binding,
  type Node,
  type PrimitiveTag,
} from "../types/node";
import { getWidgetMeta, hasWidget } from "../widgets/registry";
import { validateAgainstSchema } from "./schema-to-zod";
import { validateStyleSet, type StyleIssue } from "./style";

export interface Issue {
  path: string;
  message: string;
}

export interface DefinitionValidation {
  ok: boolean;
  errors: Issue[];
  warnings: Issue[];
  stats: {
    nodes: number;
    depth: number;
    widgets: number;
    slots: number;
    bytes: number;
  };
}

export interface ValidateOptions {
  /** Hosts an `image` field / background image may point at. */
  imageHosts?: string[];
  /** Skip widget content/design checks (faster draft autosave path). */
  shallow?: boolean;
}

const ALL_TAGS = new Set<string>([...CONTAINER_TAGS, ...VOID_TAGS]);
const CARD_FIELD_SET = new Set<string>(CARD_FIELDS);

/** `on*` handlers and raw-HTML/document props never belong in a template. */
const UNSAFE_PROP_RE =
  /^(on[A-Za-z]|dangerouslySetInnerHTML$|innerHTML$|outerHTML$|srcdoc$|srcDoc$|formaction$|formAction$|style$)/;

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

export function validateDefinition(
  input: unknown,
  options: ValidateOptions = {},
): DefinitionValidation {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const stats = { nodes: 0, depth: 0, widgets: 0, slots: 0, bytes: 0 };

  const fail = (path: string, message: string) =>
    errors.push({ path, message });
  const warn = (path: string, message: string) =>
    warnings.push({ path, message });

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    fail("(root)", "definition must be an object");
    return { ok: false, errors, warnings, stats };
  }
  const def = input as TemplateDefinition;

  // ── size ────────────────────────────────────────────────────────────────
  try {
    stats.bytes = utf8Bytes(JSON.stringify(def));
  } catch {
    fail("(root)", "definition is not serializable");
    return { ok: false, errors, warnings, stats };
  }
  if (stats.bytes > DEFINITION_LIMITS.maxBytes) {
    fail(
      "(root)",
      `definition too large (${stats.bytes} > ${DEFINITION_LIMITS.maxBytes} bytes)`,
    );
  }

  // ── schemaVersion / meta ────────────────────────────────────────────────
  if (def.schemaVersion !== SCHEMA_VERSION) {
    fail("schemaVersion", `must be ${SCHEMA_VERSION}`);
  }
  if (!def.meta || typeof def.meta !== "object") {
    fail("meta", "required");
  } else {
    if (!isNonEmptyString(def.meta.name, 120))
      fail("meta.name", "required, max 120 chars");
    const w = def.meta.canvasWidth;
    if (!Number.isFinite(w) || w < 280 || w > 1200) {
      fail("meta.canvasWidth", "must be a number between 280 and 1200");
    }
    if (def.meta.background !== undefined) {
      const bg = String(def.meta.background);
      if (!isTokenRefString(bg) && !VALUE_RE.color.test(bg)) {
        fail("meta.background", "must be a colour or a colour token");
      }
    }
  }

  // ── tokens ──────────────────────────────────────────────────────────────
  validateTokens(def, errors, warnings);

  // ── fonts ───────────────────────────────────────────────────────────────
  validateFonts(def.fonts, errors, warnings);

  // ── root tree ───────────────────────────────────────────────────────────
  const seenNodeIds = new Set<string>();
  const seenKeys = new Set<string>();

  if (!def.root || typeof def.root !== "object") {
    fail("root", "required");
  } else {
    if (
      !isElement(def.root as Node) ||
      (def.root as { tag?: string }).tag !== "frame"
    ) {
      fail("root", 'must be an element node with tag "frame"');
    }
    validateTree(def.root as Node, "root", {
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
    } else {
      const colours = new Set(Object.keys(def.tokens?.color ?? {}));
      for (const key of def.settings.allowTokenOverride) {
        if (!colours.has(String(key))) {
          warn(
            `settings.allowTokenOverride.${String(key)}`,
            "not a colour token in this template — the override will do nothing",
          );
        }
      }
    }
  }

  // ── global caps ─────────────────────────────────────────────────────────
  if (stats.nodes > DEFINITION_LIMITS.maxNodes) {
    fail(
      "(root)",
      `too many nodes (${stats.nodes} > ${DEFINITION_LIMITS.maxNodes})`,
    );
  }
  if (stats.depth > DEFINITION_LIMITS.maxDepth) {
    fail(
      "(root)",
      `tree too deep (${stats.depth} > ${DEFINITION_LIMITS.maxDepth})`,
    );
  }

  return { ok: errors.length === 0, errors, warnings, stats };
}

// ─── Tokens ──────────────────────────────────────────────────────────────────

function validateTokens(
  def: TemplateDefinition,
  errors: Issue[],
  warnings: Issue[],
): void {
  if (!def.tokens || typeof def.tokens !== "object") {
    errors.push({ path: "tokens", message: "required" });
    return;
  }
  for (const group of TOKEN_GROUPS) {
    const table = (def.tokens as Record<TokenGroup, unknown>)[group];
    if (table === undefined) {
      if (group === "color")
        errors.push({ path: "tokens.color", message: "required" });
      continue;
    }
    if (!table || typeof table !== "object" || Array.isArray(table)) {
      errors.push({ path: `tokens.${group}`, message: "must be an object" });
      continue;
    }
    const entries = Object.entries(table as Record<string, unknown>);
    if (entries.length > DEFINITION_LIMITS.maxTokensPerGroup) {
      errors.push({
        path: `tokens.${group}`,
        message: `too many tokens (${entries.length} > ${DEFINITION_LIMITS.maxTokensPerGroup})`,
      });
    }
    for (const [name, value] of entries) {
      const path = `tokens.${group}.${name}`;
      if (!IDENT_RE.test(name)) {
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

function isValidTokenLiteral(group: TokenGroup, v: string): boolean {
  switch (group) {
    case "color":
      return VALUE_RE.color.test(v);
    case "space":
    case "radius":
    case "size":
      return VALUE_RE.length.test(v);
    case "font":
      return VALUE_RE.fontFamily.test(v);
    case "shadow":
      return /^[a-z0-9\s.,()#%/-]+$/i.test(v) && !/[;{}@\\]/.test(v);
    default:
      return false;
  }
}

// ─── Fonts ───────────────────────────────────────────────────────────────────

function validateFonts(
  fonts: FontSpec[] | undefined,
  errors: Issue[],
  warnings: Issue[],
): void {
  if (fonts === undefined) return;
  if (!Array.isArray(fonts)) {
    errors.push({ path: "fonts", message: "must be an array" });
    return;
  }
  if (fonts.length > DEFINITION_LIMITS.maxFonts) {
    errors.push({
      path: "fonts",
      message: `too many fonts (max ${DEFINITION_LIMITS.maxFonts})`,
    });
  }
  fonts.forEach((f, i) => {
    const p = `fonts[${i}]`;
    if (!f || typeof f !== "object") {
      errors.push({ path: p, message: "must be an object" });
      return;
    }
    if (
      !isNonEmptyString(f.family, 64) ||
      !VALUE_RE.fontFamily.test(f.family)
    ) {
      errors.push({ path: `${p}.family`, message: "invalid font family" });
    }
    if (!Array.isArray(f.weights) || !f.weights.length) {
      errors.push({
        path: `${p}.weights`,
        message: "at least one weight required",
      });
    } else if (
      f.weights.some((w) => !Number.isInteger(w) || w < 100 || w > 900)
    ) {
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

// ─── Tree ────────────────────────────────────────────────────────────────────

interface TreeCtx {
  errors: Issue[];
  warnings: Issue[];
  seenNodeIds: Set<string>;
  seenKeys: Set<string>;
  stats: DefinitionValidation["stats"];
  options: ValidateOptions;
  tokens: TemplateDefinition["tokens"];
}

function validateTree(root: Node, basePath: string, ctx: TreeCtx): void {
  ctx.stats.nodes += countNodes(root);
  ctx.stats.depth = Math.max(ctx.stats.depth, maxDepth(root));

  const pathOf = new Map<string, string>();
  pathOf.set(root.id, basePath);

  walkTreeOrder(root, (node) => {
    const path = pathOf.get(node.id) ?? `${basePath}#${node.id}`;
    validateNode(node, path, ctx);

    if (isElement(node) && node.children) {
      node.children.forEach((child, i) => {
        if (
          child &&
          typeof child === "object" &&
          typeof child.id === "string"
        ) {
          pathOf.set(child.id, `${path}.children[${i}]`);
        }
      });
    }
  });
}

function validateNode(node: Node, path: string, ctx: TreeCtx): void {
  const { errors, warnings, seenNodeIds } = ctx;

  if (!node || typeof node !== "object") {
    errors.push({ path, message: "node must be an object" });
    return;
  }

  // id
  if (
    typeof node.id !== "string" ||
    !IDENT_RE.test(node.id) ||
    node.id.length > 64
  ) {
    errors.push({
      path: `${path}.id`,
      message: "id must match [A-Za-z0-9_-] and be ≤ 64 chars",
    });
  } else if (seenNodeIds.has(node.id)) {
    errors.push({
      path: `${path}.id`,
      message: `duplicate node id "${node.id}"`,
    });
  } else {
    seenNodeIds.add(node.id);
  }

  // style
  const styleIssues: StyleIssue[] = [];
  validateStyleSet(node.style, `${path}.style`, styleIssues);
  errors.push(...styleIssues);

  // hidden
  if (node.hidden !== undefined) {
    if (typeof node.hidden !== "object" || Array.isArray(node.hidden)) {
      errors.push({ path: `${path}.hidden`, message: "must be an object" });
    } else {
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
        message: `unknown node kind "${String((node as { kind?: unknown }).kind)}"`,
      });
  }

  if (node.a11y && typeof node.a11y !== "object") {
    warnings.push({
      path: `${path}.a11y`,
      message: "ignored — must be an object",
    });
  }
}

function validateElement(
  node: Node & { kind: "element" },
  path: string,
  ctx: TreeCtx,
): void {
  const { errors, warnings } = ctx;

  if (typeof node.tag !== "string" || !ALL_TAGS.has(node.tag)) {
    errors.push({
      path: `${path}.tag`,
      message: `unknown tag "${String(node.tag)}"`,
    });
    return;
  }
  const tag = node.tag as PrimitiveTag;

  // children
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      errors.push({ path: `${path}.children`, message: "must be an array" });
    } else if (!CONTAINER_TAGS.includes(tag) && node.children.length) {
      errors.push({
        path: `${path}.children`,
        message: `<${tag}> cannot have children`,
      });
    } else if (node.children.length > 100) {
      errors.push({
        path: `${path}.children`,
        message: "too many children (max 100)",
      });
    }
  }

  // props
  const props = (node.props ?? {}) as Record<string, unknown>;
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
    if (
      level !== undefined &&
      (!Number.isInteger(level) ||
        (level as number) < 1 ||
        (level as number) > 6)
    ) {
      errors.push({ path: `${path}.props.level`, message: "must be 1–6" });
    }
  }
  if (tag === "image") {
    if (props.src !== undefined && !node.bind && !safeUrl(props.src)) {
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
    if (typeof props.name === "string" && !IDENT_RE.test(props.name)) {
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
    if (
      (action === undefined || action === "link") &&
      props.href !== undefined
    ) {
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
  if (
    tag === "richtext" &&
    props.html !== undefined &&
    typeof props.html !== "string"
  ) {
    errors.push({ path: `${path}.props.html`, message: "must be a string" });
  }

  // binding
  if (node.bind !== undefined) validateBinding(node.bind, `${path}.bind`, ctx);
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

function validateBinding(bind: Binding, path: string, ctx: TreeCtx): void {
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
      if (
        bind.format !== undefined &&
        !BINDING_FORMATS.includes(bind.format)
      ) {
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

function validateWidget(
  node: Node & { kind: "widget" },
  path: string,
  ctx: TreeCtx,
): void {
  const { errors, warnings, seenKeys, options } = ctx;

  if (!isNonEmptyString(node.widget, 64) || !hasWidget(node.widget)) {
    errors.push({
      path: `${path}.widget`,
      message: `unknown widget type "${String(node.widget)}"`,
    });
    return;
  }
  const meta = getWidgetMeta(node.widget)!;

  if (meta.deprecated) {
    warnings.push({
      path: `${path}.widget`,
      message: `"${node.widget}" is deprecated since ${meta.deprecated.since}${
        meta.deprecated.replacedBy ? ` — use ${meta.deprecated.replacedBy}` : ""
      }`,
    });
  }

  // key
  if (
    typeof node.key !== "string" ||
    !IDENT_RE.test(node.key) ||
    node.key.length > 64
  ) {
    errors.push({
      path: `${path}.key`,
      message: "key must match [A-Za-z0-9_-] and be ≤ 64 chars",
    });
  } else if (seenKeys.has(node.key)) {
    errors.push({
      path: `${path}.key`,
      message: `duplicate content key "${node.key}"`,
    });
  } else {
    seenKeys.add(node.key);
  }

  if (!isNonEmptyString(node.label, 80)) {
    errors.push({ path: `${path}.label`, message: "required, max 80 chars" });
  }
  if (node.role !== undefined && !IDENT_RE.test(String(node.role))) {
    errors.push({
      path: `${path}.role`,
      message: "role must match [A-Za-z0-9_-]",
    });
  }

  // partStyles must reference real parts, else the CSS is dead weight
  if (node.partStyles !== undefined) {
    if (typeof node.partStyles !== "object" || Array.isArray(node.partStyles)) {
      errors.push({ path: `${path}.partStyles`, message: "must be an object" });
    } else {
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
        const styleIssues: StyleIssue[] = [];
        validateStyleSet(set, p, styleIssues);
        errors.push(...styleIssues);
      }
    }
  }

  if (options.shallow) return;

  // design must satisfy the widget's designSchema
  if (node.design !== undefined) {
    const res = validateAgainstSchema(meta.designSchema ?? [], node.design, {
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
    } else {
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
  } else if (node.defaultContent !== undefined) {
    const res = validateAgainstSchema(meta.contentSchema, node.defaultContent, {
      imageHosts: options.imageHosts,
      partial: true,
    });
    for (const issue of res.issues) {
      errors.push({
        path: `${path}.defaultContent.${issue.path}`,
        message: issue.message,
      });
    }
  } else {
    warnings.push({
      path: `${path}.defaultContent`,
      message:
        "no demo content — the widget will look empty until the user fills it in",
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
    if (!isElement(node.layout)) {
      errors.push({
        path: `${path}.layout`,
        message: "must be an element node",
      });
    } else {
      // Layout node ids only need to be unique WITHIN the widget's own subtree.
      // The compiler scopes every layout node under its widget
      // (`.n<widget> .n<layoutNode>`), so the same id (e.g. "root", "icon",
      // "label") may legitimately appear in another widget's layout or match
      // the template's own root id. Validate the subtree with a fresh id set
      // instead of the global one, while still accumulating errors/warnings/
      // stats into the shared context.
      validateTree(node.layout, `${path}.layout`, {
        ...ctx,
        seenNodeIds: new Set<string>(),
      });
    }
  }
}

function validateSlot(
  node: Node & { kind: "slot" },
  path: string,
  ctx: TreeCtx,
): void {
  const { errors, warnings, seenKeys } = ctx;

  if (typeof node.key !== "string" || !IDENT_RE.test(node.key)) {
    errors.push({
      path: `${path}.key`,
      message: "key must match [A-Za-z0-9_-]",
    });
  } else if (seenKeys.has(node.key)) {
    errors.push({
      path: `${path}.key`,
      message: `duplicate content key "${node.key}"`,
    });
  } else {
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
  } else {
    for (const type of node.allow) {
      if (!hasWidget(String(type))) {
        errors.push({
          path: `${path}.allow`,
          message: `unknown widget type "${String(type)}"`,
        });
      } else if (getWidgetMeta(String(type))!.derived) {
        errors.push({
          path: `${path}.allow`,
          message: `"${String(type)}" is derived from card data and cannot be user-added`,
        });
      }
    }
  }
  if (
    node.max !== undefined &&
    (!Number.isInteger(node.max) || node.max < 1 || node.max > 20)
  ) {
    errors.push({ path: `${path}.max`, message: "must be an integer 1–20" });
  }

  if (node.presets !== undefined) {
    if (typeof node.presets !== "object" || Array.isArray(node.presets)) {
      errors.push({ path: `${path}.presets`, message: "must be an object" });
    } else {
      for (const [type, preset] of Object.entries(node.presets)) {
        const p = `${path}.presets.${type}`;
        if (!hasWidget(type)) {
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
        const known = new Set(
          (getWidgetMeta(type)!.parts ?? []).map((x) => x.key),
        );
        for (const [part, set] of Object.entries(preset?.partStyles ?? {})) {
          if (!known.has(part)) {
            warnings.push({
              path: `${p}.partStyles.${part}`,
              message: "unknown part — dead CSS",
            });
            continue;
          }
          const styleIssues: StyleIssue[] = [];
          validateStyleSet(set, `${p}.partStyles.${part}`, styleIssues);
          errors.push(...styleIssues);
        }
      }
    }
  }
}

// ─── Popups ──────────────────────────────────────────────────────────────────

function validatePopups(popups: PopupDef[] | undefined, ctx: TreeCtx): void {
  if (popups === undefined) return;
  const { errors } = ctx;

  if (!Array.isArray(popups)) {
    errors.push({ path: "popups", message: "must be an array" });
    return;
  }
  if (popups.length > DEFINITION_LIMITS.maxPopups) {
    errors.push({
      path: "popups",
      message: `too many popups (max ${DEFINITION_LIMITS.maxPopups})`,
    });
  }

  const keys = new Set<string>();
  popups.forEach((popup, i) => {
    const path = `popups[${i}]`;
    if (!popup || typeof popup !== "object") {
      errors.push({ path, message: "must be an object" });
      return;
    }
    if (!isNonEmptyString(popup.key, 64) || !IDENT_RE.test(popup.key)) {
      errors.push({
        path: `${path}.key`,
        message: "key must match [A-Za-z0-9_-]",
      });
    } else if (keys.has(popup.key)) {
      errors.push({
        path: `${path}.key`,
        message: `duplicate popup key "${popup.key}"`,
      });
    } else {
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
      if (!Number.isFinite(d) || (d as number) < 0 || (d as number) > 600) {
        errors.push({
          path: `${path}.delaySeconds`,
          message: "must be 0–600 seconds",
        });
      }
    }

    const styleIssues: StyleIssue[] = [];
    validateStyleSet(popup.backdrop, `${path}.backdrop`, styleIssues);
    validateStyleSet(popup.panel, `${path}.panel`, styleIssues);
    errors.push(...styleIssues);

    if (!popup.root || typeof popup.root !== "object") {
      errors.push({ path: `${path}.root`, message: "required" });
    } else {
      validateTree(popup.root as Node, `${path}.root`, ctx);
    }
  });
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function isNonEmptyString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

function isTokenRefString(v: string): boolean {
  return /^\{(color|space|radius|font|size|shadow)\.[A-Za-z0-9_-]+\}$/.test(v);
}

/** Throwable wrapper for call sites that want an exception. */
export function assertValidDefinition(
  input: unknown,
  options?: ValidateOptions,
): TemplateDefinition {
  const result = validateDefinition(input, options);
  if (!result.ok) {
    const detail = result.errors
      .slice(0, 10)
      .map((e) => `${e.path}: ${e.message}`)
      .join("; ");
    throw new Error(
      `Invalid template definition (${result.errors.length} error${
        result.errors.length === 1 ? "" : "s"
      }): ${detail}`,
    );
  }
  return input as TemplateDefinition;
}

/** Automatically sanitizes template definition for valid save & publish. */
export function sanitizeTemplateDefinition<T = unknown>(input: T): T {
  if (!input || typeof input !== "object") return input;
  const cloned = structuredClone(input) as Record<string, any>;

  function isUnallowedImage(url: string): boolean {
    if (typeof url !== "string" || !url.startsWith("http")) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (
        hostname.includes("tapsleek") ||
        hostname.includes("r2.") ||
        hostname.includes("localhost")
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  function sanitizeObj(obj: any): void {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string" && isUnallowedImage(val)) {
        obj[key] = "";
      } else if (Array.isArray(val)) {
        val.forEach((item) => sanitizeObj(item));
      } else if (val && typeof val === "object") {
        sanitizeObj(val);
      }
    }
  }

  function deduplicateSubtreeIds(rootNode: any): void {
    if (!rootNode || typeof rootNode !== "object") return;

    const idCounts = new Map<string, number>();
    function count(node: any): void {
      if (!node || typeof node !== "object") return;
      if (typeof node.id === "string") {
        idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1);
      }
      // Do not traverse into widget layout here, as layout has its own scope
      if (Array.isArray(node.children)) {
        node.children.forEach(count);
      }
    }
    count(rootNode);

    const seenIds = new Set<string>();

    function makeUnique(base: string): string {
      let candidate = base;
      let counter = 1;
      while (seenIds.has(candidate) || idCounts.has(candidate)) {
        candidate = `${base}_${counter++}`;
      }
      return candidate;
    }

    function resolve(node: any): void {
      if (!node || typeof node !== "object") return;

      if (typeof node.id === "string") {
        const countForId = idCounts.get(node.id) || 0;
        const isDupe = countForId > 1;
        const isContainer =
          node.kind === "element" &&
          (node.tag === "frame" || node.tag === "grid");

        if (seenIds.has(node.id) || (isDupe && isContainer)) {
          const prefix = isContainer ? node.tag || "frame" : node.id;
          const newId = makeUnique(prefix);
          node.id = newId;
          seenIds.add(newId);
        } else {
          seenIds.add(node.id);
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(resolve);
      }
    }

    resolve(rootNode);
  }

  function walkNode(node: any): void {
    if (!node || typeof node !== "object") return;

    // 1. Fix <button> with children -> convert tag to <link>
    if (
      node.kind === "element" &&
      node.tag === "button" &&
      Array.isArray(node.children) &&
      node.children.length > 0
    ) {
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

  function deduplicateContentKeys(def: any): void {
    if (!def || typeof def !== "object") return;
    const seenKeys = new Set<string>();

    function makeUniqueKey(base: string): string {
      const slug =
        base
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "_")
          .replace(/^_+|_+$/g, "") || "widget";
      if (!seenKeys.has(slug)) return slug;
      for (let i = 2; i < 5000; i++) {
        const candidate = `${slug}_${i}`;
        if (!seenKeys.has(candidate)) return candidate;
      }
      return `${slug}_${Date.now().toString(36)}`;
    }

    function walk(node: any): void {
      if (!node || typeof node !== "object") return;
      if (
        (node.kind === "widget" || node.kind === "slot") &&
        typeof node.key === "string"
      ) {
        if (seenKeys.has(node.key)) {
          const freshKey = makeUniqueKey(node.key);
          node.key = freshKey;
          seenKeys.add(freshKey);
        } else {
          seenKeys.add(node.key);
        }
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    }

    if (def.root) walk(def.root);
    if (Array.isArray(def.popups)) {
      def.popups.forEach((p: any) => p && p.root && walk(p.root));
    }
  }

  if (cloned.root) {
    deduplicateSubtreeIds(cloned.root);
    walkNode(cloned.root);
    deduplicateContentKeys(cloned);
  }

  return cloned as T;
}
