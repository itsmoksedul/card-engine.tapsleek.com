import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        title: string;
        description: string;
        items: never[];
    };
    typical: Record<string, unknown>;
    stress: {
        title: string;
        description: string;
        items: any[];
    };
};
