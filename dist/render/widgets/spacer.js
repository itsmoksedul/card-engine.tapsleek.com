"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacerRender = SpacerRender;
const jsx_runtime_1 = require("react/jsx-runtime");
function SpacerRender({ design, cls }) {
    const d = (design ?? {});
    // Pure layout: always renders (its height comes from partStyles), never empty.
    return (0, jsx_runtime_1.jsx)("div", { className: cls('root'), "data-size": d.size ?? 'md', "aria-hidden": true });
}
