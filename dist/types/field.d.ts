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
export type FieldType = 'text' | 'textarea' | 'richtext' | 'url' | 'email' | 'tel' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'icon' | 'date' | 'time' | 'reference' | 'repeater' | 'group';
/** Show this field only when another field in the same object has a value. */
export interface VisibleIf {
    key: string;
    equals: string | number | boolean | (string | number | boolean)[];
}
interface FieldBase {
    key: string;
    label: string;
    /** Helper text under the control. */
    hint?: string;
    required?: boolean;
    visibleIf?: VisibleIf;
}
export interface TextField extends FieldBase {
    type: 'text' | 'textarea' | 'url' | 'email' | 'tel';
    placeholder?: string;
    min?: number;
    max?: number;
    /** Anchored regex source, validated on the server too. */
    pattern?: string;
    default?: string;
}
export interface RichTextField extends FieldBase {
    type: 'richtext';
    toolbar?: ('b' | 'i' | 'u' | 'link' | 'ul' | 'ol' | 'h3')[];
    max?: number;
    default?: string;
}
export interface NumberField extends FieldBase {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
    default?: number;
}
export interface BooleanField extends FieldBase {
    type: 'boolean';
    default?: boolean;
}
export interface SelectField extends FieldBase {
    type: 'select';
    options: {
        value: string;
        label: string;
        hint?: string;
    }[];
    multiple?: boolean;
    default?: string | string[];
}
export interface ColorField extends FieldBase {
    type: 'color';
    /** Offer the template's tokens as swatches. */
    allowToken?: boolean;
    default?: string;
}
export interface ImageField extends FieldBase {
    type: 'image';
    /** Suggested crop, e.g. "1/1", "4/3", "16/9". Advisory, not enforced. */
    ratio?: string;
    maxMB?: number;
    accept?: string[];
    default?: string;
}
export interface IconField extends FieldBase {
    type: 'icon';
    set?: 'lucide' | 'fa6';
    default?: string;
}
export interface DateTimeField extends FieldBase {
    type: 'date' | 'time';
    default?: string;
}
/** Points at another row the backend resolves before render. */
export interface ReferenceField extends FieldBase {
    type: 'reference';
    entity: 'appointmentProfile' | 'cardLink' | 'product';
    multiple?: boolean;
}
export interface RepeaterField extends FieldBase {
    type: 'repeater';
    fields: FieldSchema[];
    min?: number;
    max?: number;
    /** Row title template, e.g. "{name}" — falls back to "Item N". */
    itemLabel?: string;
    default?: Record<string, unknown>[];
}
export interface GroupField extends FieldBase {
    type: 'group';
    fields: FieldSchema[];
    collapsible?: boolean;
}
export type FieldSchema = TextField | RichTextField | NumberField | BooleanField | SelectField | ColorField | ImageField | IconField | DateTimeField | ReferenceField | RepeaterField | GroupField;
/** Hard caps enforced on every schema, regardless of what a widget declares. */
export declare const FIELD_LIMITS: {
    /** Max items in any repeater, even if the widget asks for more. */
    readonly repeaterMax: 60;
    /** Max characters in any text-ish field. */
    readonly textMax: 5000;
    /** Max characters in a richtext field (pre-sanitisation). */
    readonly richtextMax: 20000;
    /** Max nesting depth of group/repeater. */
    readonly depth: 4;
};
/** Build the default value for a schema — used for new widgets and repeater rows. */
export declare function defaultsFor(fields: FieldSchema[]): Record<string, unknown>;
/** Walk every field in a schema, including nested repeater/group children. */
export declare function walkFields(fields: FieldSchema[], visit: (field: FieldSchema, path: string[], depth: number) => void, path?: string[], depth?: number): void;
export {};
