import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        url: string;
        thumbnail: string;
        caption: string;
    };
    typical: Record<string, unknown>;
    stress: {
        url: unknown;
        thumbnail: string;
        caption: string;
    };
};
