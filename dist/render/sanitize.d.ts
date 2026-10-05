export type SanitizePolicy = "richtext" | "embed" | "svg";
export declare const ALLOWED_IFRAME_DOMAINS: string[];
/** Links: http(s), mailto, tel, sms, in-page and relative paths only. */
export declare function safeHref(value: unknown): string | null;
/**
 * Rebuild `html` keeping only what `policy` allows. Unknown tags are unwrapped
 * (their text survives), dangerous ones are dropped with their content, and
 * every opened tag is closed so the result is always well-formed.
 */
export declare function sanitizeHtml(html: unknown, policy?: SanitizePolicy): string;
