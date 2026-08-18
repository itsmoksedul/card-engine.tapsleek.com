// Edge-safe DOMPurify for @tapsleek/card-engine.
//
// Replaces `isomorphic-dompurify`, which loads jsdom on the server. jsdom
// (a) added ~25 MB to the server bundle and (b) does not run on Cloudflare
// Workers / edge runtimes. Here we use the browser's native DOM when it exists,
// and linkedom — a tiny, edge-compatible DOM — during server/SSR rendering.
// DOMPurify's sanitization behaviour and every existing `.sanitize()` config
// are unchanged.
import createDOMPurify from "dompurify";
import { parseHTML } from "linkedom";

function createPurifier() {
  if (
    typeof window !== "undefined" &&
    (window as { document?: unknown }).document
  ) {
    return createDOMPurify(window as unknown as Window & typeof globalThis);
  }
  const { window: edgeWindow } = parseHTML(
    "<!DOCTYPE html><html><head></head><body></body></html>",
  );
  return createDOMPurify(edgeWindow as unknown as Window & typeof globalThis);
}

const DOMPurify = createPurifier();

export const embedPurifier = createPurifier();

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

embedPurifier.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const el = node as Element;
    const src = el.getAttribute('src');
    let allowed = false;
    if (src) {
      try {
        const url = new URL(src);
        if (ALLOWED_IFRAME_DOMAINS.includes(url.hostname)) {
          allowed = true;
        }
      } catch {}
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

export default DOMPurify;
