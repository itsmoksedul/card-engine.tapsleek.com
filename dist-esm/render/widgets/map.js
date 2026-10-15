import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EmptyState, navProps } from './shared';
const HEIGHT_MAP = {
    sm: '200px',
    md: '300px',
    lg: '450px',
};
export function MapRender({ design, content, cls, ctx }) {
    const d = (design ?? {});
    const c = (content ?? {});
    const address = (c.address || '').trim();
    if (!address) {
        return _jsx(EmptyState, { cls: cls, ctx: ctx, label: "No address provided" });
    }
    const height = HEIGHT_MAP[d.height] || '300px';
    const mapType = d.mapType === 'k' ? 'k' : 'm'; // k=satellite, m=roadmap
    // Embed URL for Google Maps (no API key required)
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    return (_jsxs("div", { className: cls('root'), children: [c.label && _jsx("div", { className: cls('label'), children: c.label }), d.showAddress !== false && (_jsx("div", { className: cls('address'), children: address })), _jsx("div", { className: cls('mapWrapper'), style: { height, minHeight: height }, children: _jsx("iframe", { width: "100%", height: "100%", style: { width: '100%', height: '100%', border: 0, display: 'block' }, loading: "lazy", allowFullScreen: true, referrerPolicy: "strict-origin-when-cross-origin", src: embedUrl, title: `Map to ${address}` }) }), d.showDirectionsBtn !== false && (_jsxs("a", { ...navProps(directionsUrl, ctx.isEditing ?? false, '_blank'), className: cls('directionsBtn'), children: [_jsx("span", { className: cls('icon'), "data-icon": "Navigation", "aria-hidden": true }), "Get Directions"] }))] }));
}
