import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        label: string;
        url: string;
    };
    typical: Record<string, unknown>;
    stress: {
        label: string;
        url: string;
        icon: string;
        caption: string;
        newTab: boolean;
    };
};
