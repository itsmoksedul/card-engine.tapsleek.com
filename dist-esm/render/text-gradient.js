import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { textGradientCss } from "../compile/declarations";
/** Every `textGradient` used anywhere in the design (nodes, parts, blocks, popups). */
export function collectTextGradients(definition) {
    const found = new Map();
    const seen = new Set();
    const walk = (v, depth) => {
        if (!v || typeof v !== "object" || depth > 60 || seen.has(v))
            return;
        seen.add(v);
        if (Array.isArray(v)) {
            for (const x of v)
                walk(x, depth + 1);
            return;
        }
        const obj = v;
        if (obj.textGradient) {
            const g = textGradientCss(obj.textGradient);
            if (g && !found.has(g.id))
                found.set(g.id, g);
        }
        for (const key of Object.keys(obj)) {
            if (key === "textGradient")
                continue;
            walk(obj[key], depth + 1);
        }
    };
    walk(definition, 0);
    return [...found.values()];
}
/**
 * The SVG gradients icons are painted with (`fill/stroke: url(#tsg-…)`).
 * Rendered once per card; invisible and out of the layout.
 */
export function TextGradientDefs({ definition }) {
    const gradients = useMemo(() => collectTextGradients(definition), [definition]);
    if (!gradients.length)
        return null;
    return (_jsx("svg", { "aria-hidden": "true", focusable: "false", width: "0", height: "0", style: { position: "absolute", width: 0, height: 0, overflow: "hidden" }, children: _jsx("defs", { children: gradients.map((g) => (_jsx("linearGradient", { id: g.id, x1: "0", y1: "0", x2: "1", y2: "0", 
                // CSS 90deg (left → right) is the unrotated SVG direction.
                gradientTransform: `rotate(${g.angle - 90} 0.5 0.5)`, children: g.stops.map((s, i) => (_jsx("stop", { offset: s.offset ?? `${(i / (g.stops.length - 1)) * 100}%`, style: { stopColor: s.color } }, i))) }, g.id))) }) }));
}
