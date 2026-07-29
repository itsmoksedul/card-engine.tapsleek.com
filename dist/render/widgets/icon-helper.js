"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderIcon = RenderIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const LucideIcons = __importStar(require("lucide-react"));
const COMMON_ICON_MAP = {
    PHONE: "Phone",
    EMAIL: "Mail",
    MAIL: "Mail",
    WEBSITE: "Globe",
    WHATSAPP: "MessageSquare",
    LOCATION: "MapPin",
    ADDRESS: "MapPin",
    TELEGRAM: "Send",
    LINKEDIN: "Linkedin",
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
    TWITTER: "Twitter",
    YOUTUBE: "Youtube",
    TIKTOK: "Video",
    GITHUB: "Github",
    SAVE_CONTACT: "UserPlus",
    CONNECT_NOW: "Send",
    SHARE: "Share2",
    QR: "QrCode",
};
function RenderIcon({ name, className, }) {
    if (!name)
        return null;
    let iconValue = name;
    if (typeof iconValue === "object" && iconValue !== null) {
        if (iconValue.type === "svg" && iconValue.svg) {
            return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": iconValue.name || "custom", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, dangerouslySetInnerHTML: { __html: iconValue.svg } }));
        }
        if (iconValue.type === "url" && iconValue.url) {
            return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": iconValue.name || "url", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, children: (0, jsx_runtime_1.jsx)("img", { src: iconValue.url, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) }));
        }
        if (iconValue.type === "react-icon" && iconValue.name) {
            iconValue = iconValue.name;
        }
        else {
            return null;
        }
    }
    const upper = String(iconValue).trim().toUpperCase();
    const mapped = COMMON_ICON_MAP[upper] ?? iconValue;
    const formatted = String(mapped)
        .split(/[-_ ]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    const IconComponent = LucideIcons[formatted] ??
        LucideIcons[mapped] ??
        LucideIcons[upper] ??
        LucideIcons.Globe;
    return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": String(iconValue), "aria-hidden": true, style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
        }, children: (0, jsx_runtime_1.jsx)(IconComponent, { style: { width: "1em", height: "1em", flexShrink: 0 } }) }));
}
