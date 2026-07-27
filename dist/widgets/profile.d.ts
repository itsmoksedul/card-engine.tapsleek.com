/**
 * PROFILE — the card's identity header as a single widget.
 *
 * `derived: true` means it holds no content of its own: it reads General Info
 * off the card. An admin who wants a bespoke header composes primitives with
 * bindings instead (see `Binding` in types/node.ts); this widget exists for the
 * common case where they just want the standard block with design control.
 */
import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {};
    typical: {};
    stress: {};
};
