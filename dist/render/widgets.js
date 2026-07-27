"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIDGET_RENDERERS = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// Shell components for all 11 widgets to prove the concept. 
// In the future, these should be moved to individual files in `src/widgets/{type}/Render.tsx`
const Placeholder = ({ type, cls }) => ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), children: (0, jsx_runtime_1.jsxs)("span", { children: ["Placeholder for: ", type] }) }));
exports.WIDGET_RENDERERS = {
    PROFILE: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "PROFILE", ...props }),
    CONTACT_LINKS: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "CONTACT_LINKS", ...props }),
    RICH_TEXT: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "RICH_TEXT", ...props }),
    SERVICE_LIST: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "SERVICE_LIST", ...props }),
    GALLERY: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "GALLERY", ...props }),
    FAQ: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "FAQ", ...props }),
    TESTIMONIALS: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "TESTIMONIALS", ...props }),
    BUSINESS_HOURS: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "BUSINESS_HOURS", ...props }),
    APPOINTMENT: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "APPOINTMENT", ...props }),
    LEAD_FORM: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "LEAD_FORM", ...props }),
    CTA_BUTTON: (props) => (0, jsx_runtime_1.jsx)(Placeholder, { type: "CTA_BUTTON", ...props }),
};
