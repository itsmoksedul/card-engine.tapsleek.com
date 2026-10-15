import { jsx as _jsx } from "react/jsx-runtime";
import { str } from './shared';
export function CopyrightRender({ content, cls }) {
    const c = (content ?? {});
    const text = str(c.text) || '© 2026 TapSleek. All rights reserved.';
    return (_jsx("div", { className: cls('root'), children: _jsx("span", { className: cls('text'), children: text }) }));
}
