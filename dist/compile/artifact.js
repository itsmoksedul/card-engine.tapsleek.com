"use strict";
/**
 * Build artifact — the compiled stylesheet plus everything needed to address
 * it immutably on the CDN.
 *
 * The hash is content-derived, so republishing an unchanged design produces
 * the same object key and every cache in the chain (browser, CDN, Next data
 * cache) keeps its entry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hex = sha256Hex;
exports.buildArtifact = buildArtifact;
exports.definitionFingerprint = definitionFingerprint;
exports.stableStringify = stableStringify;
const node_crypto_1 = require("node:crypto");
const compile_css_1 = require("./compile-css");
function sha256Hex(input, length = 16) {
    return (0, node_crypto_1.createHash)('sha256').update(input, 'utf8').digest('hex').slice(0, length);
}
function buildArtifact(input) {
    const { definition, templateId, version } = input;
    const prefix = (input.prefix ?? 'templates/').replace(/^\/+|\/+$/g, '');
    const result = (0, compile_css_1.compileCss)(definition, input.options);
    const hash = sha256Hex(result.css);
    const safeId = String(templateId).replace(/[^A-Za-z0-9_-]/g, '');
    return {
        css: result.css,
        hash,
        bytes: result.bytes,
        key: `${prefix}/${safeId}/v${version}.${hash}.css`,
        googleFontsHref: result.googleFontsHref,
        warnings: result.warnings,
        emptyNodes: result.emptyNodes,
    };
}
/**
 * Stable fingerprint of the *design inputs*, used to skip a recompile when a
 * draft save didn't actually change anything the stylesheet depends on.
 */
function definitionFingerprint(def) {
    return sha256Hex(stableStringify(def), 32);
}
/** JSON.stringify with sorted keys, so key order can't churn the hash. */
function stableStringify(value) {
    if (value === null || typeof value !== 'object')
        return JSON.stringify(value) ?? 'null';
    if (Array.isArray(value))
        return `[${value.map(stableStringify).join(',')}]`;
    const keys = Object.keys(value).sort();
    const parts = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`);
    return `{${parts.join(',')}}`;
}
