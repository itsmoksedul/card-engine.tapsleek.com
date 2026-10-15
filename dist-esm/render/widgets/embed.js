"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { sanitizeHtml } from '../sanitize';
import { EmptyState } from './shared';
const HEIGHT_MAP = {
    small: '150px',
    medium: '300px',
    large: '600px',
    full: '100vh',
    auto: '100%', // relying on iframe content or wrapper to size it
};
export function EmbedRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const rawHtml = String(c.html || '').trim();
    const sanitizedHtml = useMemo(() => {
        if (!rawHtml)
            return '';
        return sanitizeHtml(rawHtml, 'embed');
    }, [rawHtml]);
    if (!sanitizedHtml) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No embed code provided" });
    }
    const rootStyle = d.removePadding ? { padding: 0, gap: 0, background: 'transparent' } : undefined;
    const height = HEIGHT_MAP[d.height] || 'auto';
    // Apply styling to the inner iframe
    const wrapperStyle = { height };
    if (height !== 'auto') {
        wrapperStyle.display = 'block';
    }
    return (_jsxs("div", { className: cls('root'), style: rootStyle, children: [_jsx("div", { className: cls('wrapper'), style: wrapperStyle, dangerouslySetInnerHTML: { __html: sanitizedHtml } }), c.caption && _jsx("div", { className: cls('caption'), children: c.caption })] }));
}
