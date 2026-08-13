"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Edge-safe DOMPurify for @tapsleek/card-engine.
//
// Replaces `isomorphic-dompurify`, which loads jsdom on the server. jsdom
// (a) added ~25 MB to the server bundle and (b) does not run on Cloudflare
// Workers / edge runtimes. Here we use the browser's native DOM when it exists,
// and linkedom — a tiny, edge-compatible DOM — during server/SSR rendering.
// DOMPurify's sanitization behaviour and every existing `.sanitize()` config
// are unchanged.
const dompurify_1 = __importDefault(require("dompurify"));
const linkedom_1 = require("linkedom");
function createPurifier() {
    if (typeof window !== "undefined" &&
        window.document) {
        return (0, dompurify_1.default)(window);
    }
    const { window: edgeWindow } = (0, linkedom_1.parseHTML)("<!DOCTYPE html><html><head></head><body></body></html>");
    return (0, dompurify_1.default)(edgeWindow);
}
const DOMPurify = createPurifier();
exports.default = DOMPurify;
