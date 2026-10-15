"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, EmptyState, navProps, str } from './shared';
import { NativeCarousel } from '../components/NativeCarousel';
function getYoutubeId(url) {
    const match = url.match(/(?:youtu\.be\/|(?:www\.)?youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}
export function VideoGalleryRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const videos = asArray(c.videos);
    if (!videos.length) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No videos in gallery" });
    }
    const layout = d.layout ?? 'grid';
    const aspectRatio = d.aspectRatio ?? '16/9';
    const renderedItems = videos.map((video, i) => {
        const ytId = getYoutubeId(video.url || '');
        const thumbUrl = video.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
        return (_jsxs("a", { className: cls('item'), ...navProps(video.url, ctx.isEditing ?? false, '_blank'), children: [_jsxs("div", { style: { position: 'relative', width: '100%', aspectRatio }, children: [thumbUrl ? (_jsx("img", { src: thumbUrl || undefined, alt: video.caption || 'Video thumbnail', className: cls('thumbnail'), style: { height: '100%', width: '100%', objectFit: 'cover', position: 'absolute' } })) : (_jsx("div", { className: cls('thumbnail'), style: { height: '100%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx("span", { style: { fontSize: '12px', color: '#888' }, children: "No thumbnail" }) })), _jsx("div", { className: cls('playIcon'), "data-icon": "Play", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polygon", { points: "5 3 19 12 5 21 5 3" }) }) })] }), video.caption && _jsx("span", { className: cls('caption'), children: video.caption })] }, i));
    });
    return (_jsxs("div", { className: cls('root'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), c.useCarousel ? (_jsx(NativeCarousel, { cls: cls, items: renderedItems, layout: layout })) : (_jsx("div", { className: cls('grid'), "data-layout": layout, "data-cols": d.columns ?? '2', children: renderedItems }))] }));
}
