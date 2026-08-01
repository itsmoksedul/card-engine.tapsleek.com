"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoGalleryRender = VideoGalleryRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
const NativeCarousel_1 = require("../components/NativeCarousel");
function getYoutubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}
function VideoGalleryRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const videos = (0, shared_1.asArray)(c.videos);
    if (!videos.length) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No videos in gallery" });
    }
    const layout = d.layout ?? 'grid';
    const aspectRatio = d.aspectRatio ?? '16/9';
    const renderedItems = videos.map((video, i) => {
        const ytId = getYoutubeId(video.url || '');
        const thumbUrl = video.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
        return ((0, jsx_runtime_1.jsxs)("a", { className: cls('item'), ...(0, shared_1.navProps)(video.url, ctx.isEditing ?? false, '_blank'), children: [(0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', width: '100%', aspectRatio }, children: [thumbUrl ? ((0, jsx_runtime_1.jsx)("img", { src: thumbUrl || undefined, alt: video.caption || 'Video thumbnail', className: cls('thumbnail'), style: { height: '100%', width: '100%', objectFit: 'cover', position: 'absolute' } })) : ((0, jsx_runtime_1.jsx)("div", { className: cls('thumbnail'), style: { height: '100%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: '12px', color: '#888' }, children: "No thumbnail" }) })), (0, jsx_runtime_1.jsx)("div", { className: cls('playIcon'), "data-icon": "Play", children: (0, jsx_runtime_1.jsx)("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: (0, jsx_runtime_1.jsx)("polygon", { points: "5 3 19 12 5 21 5 3" }) }) })] }), video.caption && (0, jsx_runtime_1.jsx)("span", { className: cls('caption'), children: video.caption })] }, i));
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), c.useCarousel ? ((0, jsx_runtime_1.jsx)(NativeCarousel_1.NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : ((0, jsx_runtime_1.jsx)("div", { className: cls('grid'), "data-layout": layout, "data-cols": d.columns ?? '2', children: renderedItems }))] }));
}
