import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        title: string;
        items: never[];
    };
    typical: {
        title: string;
        items: {
            url: string;
            caption: string;
            link: string;
        }[];
    };
    stress: {
        title: string;
        items: {
            url: string;
            caption: string;
            link: string;
        }[];
    };
};
