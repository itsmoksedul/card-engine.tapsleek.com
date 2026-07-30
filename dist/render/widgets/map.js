"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapRender = MapRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
const HEIGHT_MAP = {
    sm: '200px',
    md: '300px',
    lg: '450px',
};
function MapRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const address = (c.address || '').trim();
    if (!address) {
        return (0, jsx_runtime_1.jsx)(shared_1.EmptyState, { cls: cls, ctx: ctx, label: "No address provided" });
    }
    const height = HEIGHT_MAP[d.height] || '300px';
    const mapType = d.mapType === 'k' ? 'k' : 'm'; // k=satellite, m=roadmap
    // Embed URL for Google Maps (no API key required)
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [c.label && (0, jsx_runtime_1.jsx)("div", { className: cls('label'), children: c.label }), d.showAddress !== false && ((0, jsx_runtime_1.jsx)("div", { className: cls('address'), children: address })), (0, jsx_runtime_1.jsx)("div", { className: cls('mapWrapper'), style: { height }, children: (0, jsx_runtime_1.jsx)("iframe", { width: "100%", height: "100%", style: { border: 0 }, loading: "lazy", allowFullScreen: true, src: embedUrl, title: `Map to ${address}` }) }), d.showDirectionsBtn !== false && ((0, jsx_runtime_1.jsxs)("a", { ...(0, shared_1.navProps)(directionsUrl, ctx.isEditing ?? false, '_blank'), className: cls('directionsBtn'), children: [(0, jsx_runtime_1.jsx)("span", { className: cls('icon'), "data-icon": "Navigation", "aria-hidden": true }), "Get Directions"] }))] }));
}
