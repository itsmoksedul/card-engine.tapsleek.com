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
const compile_css_1 = require("./compile-css");
function sha256Hex(input, length = 16) {
    try {
        const nodeCrypto = typeof require !== 'undefined' ? require('crypto') : null;
        if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
            return nodeCrypto.createHash('sha256').update(input, 'utf8').digest('hex').slice(0, length);
        }
    }
    catch {
        // ignore
    }
    // Pure JS fallback so React Native / bundlers never fail to resolve
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
    return hex.repeat(2).slice(0, length);
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
