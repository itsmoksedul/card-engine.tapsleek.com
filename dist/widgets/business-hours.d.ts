import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        title: string;
        timezone: string;
        days: never[];
        note: string;
    };
    typical: Record<string, unknown>;
    stress: {
        title: string;
        note: string;
    };
};
