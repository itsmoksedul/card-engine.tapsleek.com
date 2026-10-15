import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RenderIcon } from './icon-helper';
export function ConnectButtonsRender({ design, cls, ctx }) {
    const d = (design ?? {});
    return (_jsxs("div", { className: cls('root'), children: [d.showSaveContact !== false && (_jsxs("button", { type: "button", className: cls('saveContact'), onClick: () => ctx.track({ type: 'VCARD_DOWNLOAD' }), children: [_jsx(RenderIcon, { name: "UserPlus" }), _jsx("span", { children: "Save Contact" })] })), d.showConnectNow !== false && (_jsxs("button", { type: "button", className: cls('connectNow'), onClick: () => ctx.track({ type: 'CONNECT_CLICK' }), children: [_jsx(RenderIcon, { name: "Send" }), _jsx("span", { children: "Connect Now" })] }))] }));
}
