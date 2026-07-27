/**
 * SERVICE_LIST — the reference implementation of a content widget.
 *
 * Shows the whole pattern: a section header, a repeater of items, design knobs
 * the admin locks, and `layout` typically unlocked to the user via
 * `WidgetNode.userOptions` so they can pick list / grid / carousel without
 * being able to touch anything else.
 */
import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
/**
 * v1 → v2: `url` was renamed to `link`, and the section header moved from a
 * bare string into `title` + `description`. Runs lazily on read; nothing is
 * rewritten in bulk.
 */
export declare const migrations: {
    2: (c: any) => {
        title: any;
        description: any;
        items: any;
    };
};
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
        items: {
            image: string;
            name: string;
            description: string;
            price: string;
            link: string;
        }[];
    };
};
