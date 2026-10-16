import React from "react";
import { type CompiledTextGradient } from "../compile/declarations";
/** Every `textGradient` used anywhere in the design (nodes, parts, blocks, popups). */
export declare function collectTextGradients(definition: unknown): CompiledTextGradient[];
/**
 * The SVG gradients icons are painted with (`fill/stroke: url(#tsg-…)`).
 * Rendered once per card; invisible and out of the layout.
 */
export declare function TextGradientDefs({ definition }: {
    definition: unknown;
}): React.JSX.Element | null;
