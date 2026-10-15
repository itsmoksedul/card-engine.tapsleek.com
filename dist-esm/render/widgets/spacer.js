import { jsx as _jsx } from "react/jsx-runtime";
export function SpacerRender({ design, cls }) {
    const d = (design ?? {});
    // Pure layout: always renders (its height comes from partStyles), never empty.
    return _jsx("div", { className: cls('root'), "data-size": d.size ?? 'md', "aria-hidden": true });
}
