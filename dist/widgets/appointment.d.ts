/**
 * APPOINTMENT — embeds a real booking flow.
 *
 * The `references` spec is what keeps the renderer pure: the backend resolves
 * `profileId` → { slug, name, duration } before the payload leaves the API,
 * exactly as the old `appointmentProfileId` pre-resolution did, but declared
 * as data instead of hardcoded in PublicCardsService.
 */
import type { WidgetModule } from '../types/widget';
export declare const meta: WidgetModule['meta'];
export declare const previews: {
    empty: {
        title: string;
        description: string;
        profileId: null;
        buttonLabel: string;
    };
    typical: Record<string, unknown>;
    stress: {
        title: string;
        description: string;
        profileId: null;
        buttonLabel: string;
    };
};
