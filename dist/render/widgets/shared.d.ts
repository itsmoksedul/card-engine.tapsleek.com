import React from 'react';
/**
 * Shared plumbing for widget renderers.
 *
 * The one rule every renderer follows: **zero styling**. No Tailwind, no inline
 * styles, no colours or spacing. A renderer only emits `cls('part')` class
 * names and a couple of `data-*` hooks. Everything visual comes from the
 * admin's `partStyles`, compiled to CSS — which is what lets one widget look
 * completely different across templates.
 */
export interface WidgetRenderProps<C = any, D = any> {
    content: C;
    design: D;
    /** part key → class name, e.g. `p-item` */
    cls: (part: string) => string;
    ctx: {
        card: any;
        links: any[];
        isEditing?: boolean;
        track: (event: any) => void;
    };
}
/** Card owner's display name, assembled the same way the backend vCard does. */
export declare function displayName(card: any): string;
/** Job title · Company — skips the separator when either side is missing. */
export declare function subtitleOf(card: any): string;
export declare function asArray<T>(value: unknown): T[];
export declare function str(value: unknown): string;
export declare function iconVal(value: unknown): string | object | null;
/**
 * In the builder an empty widget would collapse to nothing and become
 * unselectable, so mark it instead of returning null. On a live card the same
 * widget renders nothing at all.
 */
export declare function EmptyState({ cls, ctx, label, }: {
    cls: (part: string) => string;
    ctx: WidgetRenderProps['ctx'];
    label: string;
}): React.JSX.Element | null;
