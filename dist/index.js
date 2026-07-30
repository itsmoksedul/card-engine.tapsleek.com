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
__exportStar(require("./types"), exports);
__exportStar(require("./compile"), exports);
__exportStar(require("./compile/artifact"), exports);
__exportStar(require("./validate"), exports);
__exportStar(require("./widgets"), exports);
__exportStar(require("./blocks"), exports);
__exportStar(require("./content"), exports);
__exportStar(require("./catalog/links"), exports);
__exportStar(require("./render/CardRenderer"), exports);
__exportStar(require("./render/NodeRenderer"), exports);
__exportStar(require("./render/BlockRenderer"), exports);
__exportStar(require("./render/resolveBinding"), exports);
