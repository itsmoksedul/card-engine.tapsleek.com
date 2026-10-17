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
__exportStar(require("./types"), exports);
__exportStar(require("./compile"), exports);
__exportStar(require("./compile/artifact"), exports);
__exportStar(require("./validate"), exports);
__exportStar(require("./widgets"), exports);
__exportStar(require("./blocks"), exports);
__exportStar(require("./content"), exports);
__exportStar(require("./catalog/links"), exports);
__exportStar(require("./catalog/fonts"), exports);
