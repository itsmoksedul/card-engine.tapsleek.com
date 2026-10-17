import type { WidgetModule } from '../types/widget';
/** Map iframe height in px from the widget design (presets or Custom). */
export declare function mapHeightPx(design: Record<string, unknown> | undefined): number;
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        label: string;
        address: string;
    };
    typical: Record<string, unknown>;
    stress: {
        label: string;
        address: string;
    };
};
