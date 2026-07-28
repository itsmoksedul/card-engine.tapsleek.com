import React from 'react';
import type { TemplateDefinition } from '../types/definition';
import type { BlockInstance } from '../types/block';
import type { RenderCtx } from './NodeRenderer';
/**
 * One user-composed block (v2.1).
 *
 * The wrapper carries `tsb-<type>` — the class the compiler emits the template's
 * per-type preset under — so the block is styled by the card's template with no
 * per-card CSS. Design comes from `resolveBlockDesign`; the user only supplies
 * `content`. Derived widgets (Profile, Contact Buttons) ignore `content` and
 * read `ctx.card` / `ctx.links`.
 */
export declare function BlockRenderer({ definition, block, ctx, }: {
    definition: TemplateDefinition;
    block: BlockInstance;
    ctx: RenderCtx;
}): React.JSX.Element;
