import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
/** v1 → v2: `text`/`name` renamed to `quote`/`author`. */
export declare const migrations: {
    2: (c: any) => {
        title: any;
        items: any;
    };
};
export declare const previews: {
    empty: {
        title: string;
        items: never[];
    };
    typical: Record<string, unknown>;
    stress: {
        title: string;
        items: {
            quote: string;
            author: string;
            role: string;
            avatar: string;
            rating: number;
        }[];
    };
};
