"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyrightRender = CopyrightRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
function CopyrightRender({ content, cls }) {
    const c = (content ?? {});
    const text = (0, shared_1.str)(c.text) || '© 2026 TapSleek. All rights reserved.';
    return ((0, jsx_runtime_1.jsx)("div", { className: cls('root'), children: (0, jsx_runtime_1.jsx)("span", { className: cls('text'), children: text }) }));
}
