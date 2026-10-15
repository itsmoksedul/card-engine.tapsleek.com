import { jsx as _jsx } from "react/jsx-runtime";
export function DividerRender({ design, cls }) {
    const d = (design ?? {});
    return (_jsx("div", { className: cls('root'), role: "separator", "aria-hidden": true, children: _jsx("div", { className: cls('line'), "data-style": d.style ?? 'solid' }) }));
}
