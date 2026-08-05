/**
 * Portable compile surface — safe in Node AND in the browser (the builder
 * compiles the definition client-side on every keystroke for live preview).
 *
 * `artifact.ts` is deliberately NOT re-exported here: it hashes with
 * `node:crypto` and only ever runs on the backend at publish time. Import it
 * directly (`card-engine/compile/artifact`) from server code.
 */
export * from './value';
export * from './declarations';
export * from './compile-css';
export * from './color-utils';
