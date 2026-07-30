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
 * Navigation props for links in editing mode.
 *
 * When the admin is editing a template in the builder canvas, real links would
 * navigate away or open external URLs, breaking the editing flow. This helper
 * suppresses navigation in edit mode while preserving the hover/focus UX.
 */
export declare function navProps(href: string | undefined, isEditing: boolean, target?: string): Record<string, any>;
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
