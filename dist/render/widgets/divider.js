"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividerRender = DividerRender;
const jsx_runtime_1 = require("react/jsx-runtime");
function DividerRender({ design, cls }) {
    const d = (design ?? {});
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), role: "separator", "aria-hidden": true, children: (0, jsx_runtime_1.jsx)("div", { className: cls('line'), "data-style": d.style ?? 'solid' }) }));
}
