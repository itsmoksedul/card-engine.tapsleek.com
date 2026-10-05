"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedRender = EmbedRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const sanitize_1 = require("../sanitize");
const shared_1 = require("./shared");
const HEIGHT_MAP = {
    small: '150px',
    medium: '300px',
    large: '600px',
    full: '100vh',
    auto: '100%', // relying on iframe content or wrapper to size it
};
function EmbedRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const rawHtml = String(c.html || '').trim();
    const sanitizedHtml = (0, react_1.useMemo)(() => {
        if (!rawHtml)
            return '';
        return (0, sanitize_1.sanitizeHtml)(rawHtml, 'embed');
    }, [rawHtml]);
    if (!sanitizedHtml) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No embed code provided" });
    }
    const rootStyle = d.removePadding ? { padding: 0, gap: 0, background: 'transparent' } : undefined;
    const height = HEIGHT_MAP[d.height] || 'auto';
    // Apply styling to the inner iframe
    const wrapperStyle = { height };
    if (height !== 'auto') {
        wrapperStyle.display = 'block';
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), style: rootStyle, children: [(0, jsx_runtime_1.jsx)("div", { className: cls('wrapper'), style: wrapperStyle, dangerouslySetInnerHTML: { __html: sanitizedHtml } }), c.caption && (0, jsx_runtime_1.jsx)("div", { className: cls('caption'), children: c.caption })] }));
}
