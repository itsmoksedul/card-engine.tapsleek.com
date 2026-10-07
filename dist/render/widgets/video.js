"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRender = VideoRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
/**
 * Extracts a normalized embed URL for YouTube, Vimeo, or returns the raw URL for raw video formats.
 */
function parseVideoUrl(url, d) {
    if (!url)
        return null;
    const raw = url.trim();
    // Params to append
    const params = new URLSearchParams();
    if (d.autoplay) {
        params.set('autoplay', '1');
        params.set('mute', '1'); // Autoplay usually requires mute
    }
    if (!d.controls)
        params.set('controls', '0');
    if (d.loop)
        params.set('loop', '1');
    const query = params.toString() ? `?${params.toString()}` : '';
    // YouTube
    const ytMatch = raw.match(/(?:youtu\.be\/|(?:www\.)?youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch && ytMatch[1]) {
        // For YouTube looping, playlist=VIDEO_ID is required
        if (d.loop)
            params.set('playlist', ytMatch[1]);
        const ytQuery = params.toString() ? `?${params.toString()}` : '';
        return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}${ytQuery}` };
    }
    // Vimeo
    const vimeoMatch = raw.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && vimeoMatch[3]) {
        return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[3]}${query}` };
    }
    // Raw fallback (assume MP4/WebM)
    return { type: 'video', src: raw };
}
function VideoRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const video = parseVideoUrl(c.url, d);
    if (!video) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No video URL" });
    }
    const aspectRatio = d.aspectRatio ?? '16/9';
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, jsx_runtime_1.jsx)("div", { className: cls('player'), style: { aspectRatio }, children: video.type === 'iframe' ? ((0, jsx_runtime_1.jsx)("iframe", { src: video.src, style: { width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowFullScreen: true, referrerPolicy: "strict-origin-when-cross-origin", title: "Video player" })) : ((0, jsx_runtime_1.jsx)("video", { src: video.src, style: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }, controls: d.controls !== false, autoPlay: d.autoplay, muted: d.autoplay, loop: d.loop, playsInline: true })) }), c.caption && (0, jsx_runtime_1.jsx)("div", { className: cls('caption'), children: c.caption })] }));
}
