"use strict";
/**
 * Style validation.
 *
 * The trick here: the COMPILER is the validator. A style value is valid iff
 * `declarationsFor({ [key]: value })` produces at least one declaration. That
 * makes it structurally impossible for the validator and the compiler to
 * disagree — there is exactly one table of truth (`EMITTERS`), and a value the
 * compiler would silently drop is rejected at write time instead.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStyleProps = validateStyleProps;
exports.validateStyleSet = validateStyleSet;
exports.sanitizeStyleSet = sanitizeStyleSet;
const declarations_1 = require("../compile/declarations");
const style_1 = require("../types/style");
const ALLOWED = new Set(declarations_1.ALLOWED_STYLE_PROPS);
const STYLE_SET_KEYS = new Set([...style_1.BREAKPOINT_KEYS, ...style_1.STATE_KEYS]);
/** Max properties in one StyleProps object — a sanity cap, not a design limit. */
const MAX_PROPS_PER_LAYER = 60;
function validateStyleProps(props, path, issues) {
    if (props === undefined || props === null)
        return;
    if (typeof props !== 'object' || Array.isArray(props)) {
        issues.push({ path, message: 'must be an object' });
        return;
    }
    const entries = Object.entries(props);
    if (entries.length > MAX_PROPS_PER_LAYER) {
        issues.push({ path, message: `too many properties (${entries.length} > ${MAX_PROPS_PER_LAYER})` });
        return;
    }
    for (const [key, value] of entries) {
        if (!ALLOWED.has(key)) {
            issues.push({ path: `${path}.${key}`, message: `unknown style property "${key}"` });
            continue;
        }
        if (value === undefined || value === null || value === '')
            continue;
        const decls = (0, declarations_1.declarationsFor)({ [key]: value });
        if (!decls.length) {
            issues.push({
                path: `${path}.${key}`,
                message: `invalid value for "${key}" — would be dropped at compile time`,
            });
        }
    }
}
function validateStyleSet(set, path, issues) {
    if (set === undefined || set === null)
        return;
    if (typeof set !== 'object' || Array.isArray(set)) {
        issues.push({ path, message: 'must be an object' });
        return;
    }
    for (const [key, layer] of Object.entries(set)) {
        if (!STYLE_SET_KEYS.has(key)) {
            issues.push({
                path: `${path}.${key}`,
                message: `unknown style layer "${key}" (expected base | sm | md | hover | active | focus)`,
            });
            continue;
        }
        validateStyleProps(layer, `${path}.${key}`, issues);
    }
}
/**
 * Strip everything the compiler would drop, so what lands in the DB is exactly
 * what renders. Used on draft autosave, where we want tolerance rather than
 * rejection.
 */
function sanitizeStyleSet(set) {
    if (!set || typeof set !== 'object')
        return undefined;
    const out = {};
    let kept = 0;
    for (const key of [...style_1.BREAKPOINT_KEYS, ...style_1.STATE_KEYS]) {
        const layer = set[key];
        if (!layer || typeof layer !== 'object')
            continue;
        const clean = {};
        for (const [prop, value] of Object.entries(layer)) {
            if (!ALLOWED.has(prop))
                continue;
            if (value === undefined || value === null || value === '')
                continue;
            if (!(0, declarations_1.declarationsFor)({ [prop]: value }).length)
                continue;
            clean[prop] = value;
            kept++;
        }
        if (Object.keys(clean).length)
            out[key] = clean;
    }
    return kept ? out : undefined;
}
