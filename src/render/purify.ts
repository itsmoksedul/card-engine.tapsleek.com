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

export default DOMPurify;
