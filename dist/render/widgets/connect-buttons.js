"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectButtonsRender = ConnectButtonsRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const icon_helper_1 = require("./icon-helper");
function ConnectButtonsRender({ design, cls, ctx }) {
    const d = (design ?? {});
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [d.showSaveContact !== false && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: cls('saveContact'), onClick: () => ctx.track({ type: 'VCARD_DOWNLOAD' }), children: [(0, jsx_runtime_1.jsx)(icon_helper_1.RenderIcon, { name: "UserPlus" }), (0, jsx_runtime_1.jsx)("span", { children: "Save Contact" })] })), d.showConnectNow !== false && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: cls('connectNow'), onClick: () => ctx.track({ type: 'CONNECT_CLICK' }), children: [(0, jsx_runtime_1.jsx)(icon_helper_1.RenderIcon, { name: "Send" }), (0, jsx_runtime_1.jsx)("span", { children: "Connect Now" })] }))] }));
}
