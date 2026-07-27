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
export function displayName(card: any): string {
  const name = [card?.firstName, card?.lastName].filter(Boolean).join(' ').trim();
  return name || card?.name || '';
}

/** Job title · Company — skips the separator when either side is missing. */
export function subtitleOf(card: any): string {
  return [card?.jobTitle, card?.companyName].filter(Boolean).join(' · ');
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * In the builder an empty widget would collapse to nothing and become
 * unselectable, so mark it instead of returning null. On a live card the same
 * widget renders nothing at all.
 */
export function EmptyState({
  cls,
  ctx,
  label,
}: {
  cls: (part: string) => string;
  ctx: WidgetRenderProps['ctx'];
  label: string;
}) {
  if (!ctx.isEditing) return null;
  return (
    <div className={cls('root')} data-empty="true" data-placeholder={label}>
      {label}
    </div>
  );
}
