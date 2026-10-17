/**
 * `@tapsleek/card-engine/core` — everything except the React renderer.
 *
 * Types, validation, CSS compile, widget metadata, blocks, content helpers
 * and catalogs: what an app needs to EDIT cards without drawing them. The
 * renderer (render/*) pulls in React and whole icon packs (react-icons:
 * thousands of Simple Icons / Font Awesome glyphs); the mobile app shows
 * cards through the server-rendered page, so importing from here instead of
 * the root keeps ~10 MB of icons out of its bundle.
 *
 * Keep this list in step with index.ts minus the render/ exports.
 */
export * from './types';
export * from './compile';
export * from './compile/artifact';
export * from './validate';
export * from './widgets';
export * from './blocks';
export * from './content';
export * from './catalog/links';
export * from './catalog/fonts';
