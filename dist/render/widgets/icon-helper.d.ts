import { type IconPaint } from "../svg-colors";
export declare function RenderIcon({ name, className, colors, }: {
    name?: string | Record<string, any> | null;
    className?: string;
    /** Repaint an uploaded SVG's colours (slot i → colour/token/gradient). */
    colors?: ReadonlyArray<IconPaint | null | undefined> | null;
}): import("react").JSX.Element | null;
