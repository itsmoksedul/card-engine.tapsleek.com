"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Portable compile surface — safe in Node AND in the browser (the builder
 * compiles the definition client-side on every keystroke for live preview).
 *
 * `artifact.ts` is deliberately NOT re-exported here: it hashes with
 * `node:crypto` and only ever runs on the backend at publish time. Import it
 * directly (`card-engine/compile/artifact`) from server code.
 */
__exportStar(require("./value"), exports);
__exportStar(require("./declarations"), exports);
__exportStar(require("./compile-css"), exports);
__exportStar(require("./color-utils"), exports);
