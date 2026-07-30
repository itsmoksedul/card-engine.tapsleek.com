/**
 * @tapsleek/card-engine — the one implementation of the card design system.
 *
 * Currently lives inside the NestJS app so the backend half can ship first.
 * Everything here is dependency-light, framework-free TypeScript: when the
 * frontends land, this directory moves to `packages/card-engine/` unchanged and
 * the React `render/` + per-widget `Render.tsx` half is added alongside it.
 *
 * Nothing in this tree may import from `../` (the Nest app). That rule is what
 * makes the move a file move rather than a rewrite.
 */
export * from './types';
export * from './compile';
export * from './compile/artifact';
export * from './validate';
export * from './widgets';
export * from './blocks';
export * from './content';
export * from './catalog/links';
export * from './render/CardRenderer';
export * from './render/NodeRenderer';
export * from './render/BlockRenderer';
export * from './render/resolveBinding';
