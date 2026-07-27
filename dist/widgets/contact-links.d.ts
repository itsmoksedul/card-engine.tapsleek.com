/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived: links stay a first-class DB entity because they carry per-link
 * click analytics (`CardLinkDailyStat`). The widget only decides how they look
 * and which categories appear.
 */
import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {};
    typical: {};
    stress: {};
};
