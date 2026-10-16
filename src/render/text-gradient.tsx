import React, { useMemo } from "react";
import { textGradientCss, type CompiledTextGradient } from "../compile/declarations";

/** Every `textGradient` used anywhere in the design (nodes, parts, blocks, popups). */
export function collectTextGradients(definition: unknown): CompiledTextGradient[] {
  const found = new Map<string, CompiledTextGradient>();
  const seen = new Set<object>();
  const walk = (v: unknown, depth: number) => {
    if (!v || typeof v !== "object" || depth > 60 || seen.has(v as object)) return;
    seen.add(v as object);
    if (Array.isArray(v)) {
      for (const x of v) walk(x, depth + 1);
      return;
    }
    const obj = v as Record<string, unknown>;
    if (obj.textGradient) {
      const g = textGradientCss(obj.textGradient);
      if (g && !found.has(g.id)) found.set(g.id, g);
    }
    for (const key of Object.keys(obj)) {
      if (key === "textGradient") continue;
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
export function TextGradientDefs({ definition }: { definition: unknown }) {
  const gradients = useMemo(() => collectTextGradients(definition), [definition]);
  if (!gradients.length) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {gradients.map((g) => (
          <linearGradient
            key={g.id}
            id={g.id}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            // CSS 90deg (left → right) is the unrotated SVG direction.
            gradientTransform={`rotate(${g.angle - 90} 0.5 0.5)`}
          >
            {g.stops.map((s, i) => (
              <stop
                key={i}
                offset={s.offset ?? `${(i / (g.stops.length - 1)) * 100}%`}
                style={{ stopColor: s.color }}
              />
            ))}
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}
