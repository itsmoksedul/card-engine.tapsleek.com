"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedPurifier = void 0;
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
exports.embedPurifier = createPurifier();
const ALLOWED_IFRAME_DOMAINS = [
    'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
    'vimeo.com', 'player.vimeo.com',
    'google.com', 'www.google.com', 'maps.google.com',
    'calendly.com',
    'typeform.com', 'formspree.io',
    'spotify.com', 'open.spotify.com',
    'soundcloud.com', 'w.soundcloud.com',
    'apple.com', 'embed.music.apple.com'
];
exports.embedPurifier.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
        const el = node;
        const src = el.getAttribute('src');
        let allowed = false;
        if (src) {
            try {
                const url = new URL(src);
                if (ALLOWED_IFRAME_DOMAINS.includes(url.hostname)) {
                    allowed = true;
                }
            }
            catch { }
        }
        if (!allowed) {
            el.parentNode?.removeChild(el);
            return;
        }
        el.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
        const allow = el.getAttribute('allow');
        if (allow) {
            const safeFeatures = ['autoplay', 'clipboard-write', 'encrypted-media', 'fullscreen', 'picture-in-picture'];
            const filtered = allow
                .split(';')
                .map(s => s.trim())
                .filter(s => safeFeatures.includes(s))
                .join('; ');
            el.setAttribute('allow', filtered);
        }
    }
});
exports.default = DOMPurify;
