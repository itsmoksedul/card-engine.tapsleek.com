"use strict";
/**
 * FieldSchema — the declarative description of an editable form.
 *
 * One schema drives four things with zero per-widget code:
 *   • the admin inspector (design fields)
 *   • the user content editor (content fields)
 *   • runtime validation on the backend (`schemaToZod`)
 *   • the default value for a missing field (`defaultsFor`)
 *
 * This is the single piece that replaces the 818-line hand-written
 * BlockEditorModal.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIELD_LIMITS = void 0;
exports.defaultsFor = defaultsFor;
exports.walkFields = walkFields;
/** Hard caps enforced on every schema, regardless of what a widget declares. */
exports.FIELD_LIMITS = {
    /** Max items in any repeater, even if the widget asks for more. */
    repeaterMax: 60,
    /** Max characters in any text-ish field. */
    textMax: 5_000,
    /** Max characters in a richtext field (pre-sanitisation). */
    richtextMax: 20_000,
    /** Max nesting depth of group/repeater. */
    depth: 4,
};
/** Build the default value for a schema — used for new widgets and repeater rows. */
function defaultsFor(fields) {
    const out = {};
    for (const f of fields) {
        switch (f.type) {
            case 'repeater':
                out[f.key] = f.default ?? [];
                break;
            case 'group':
                out[f.key] = defaultsFor(f.fields);
                break;
            case 'boolean':
                out[f.key] = f.default ?? false;
                break;
            case 'number':
                if (f.default !== undefined)
                    out[f.key] = f.default;
                break;
            case 'reference':
                out[f.key] = f.multiple ? [] : null;
                break;
            case 'select':
                out[f.key] = f.default ?? (f.multiple ? [] : (f.options[0]?.value ?? ''));
                break;
            default:
                out[f.key] = f.default ?? '';
        }
    }
    return out;
}
/** Walk every field in a schema, including nested repeater/group children. */
function walkFields(fields, visit, path = [], depth = 0) {
    for (const f of fields) {
        const next = [...path, f.key];
        visit(f, next, depth);
        if (f.type === 'repeater' || f.type === 'group') {
            walkFields(f.fields, visit, next, depth + 1);
        }
    }
}
