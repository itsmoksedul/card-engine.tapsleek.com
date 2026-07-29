/**
 * LEAD_FORM — lead capture as a composable widget.
 *
 * Placed inline in the tree, or inside `definition.popups[]` with trigger
 * rules. Either way it is styled like any other widget, which is what removes
 * the hardcoded LeadCaptureModal. Submissions still POST to
 * /v1/public/cards/:slug/lead and land in Contact (source = DIGITAL_CARD).
 *
 * The Free-plan 4-field cap is enforced server-side at save time, not here.
 */
import type { WidgetModule } from "../types/widget";
export declare const meta: WidgetModule["meta"];
export declare const previews: {
    empty: {
        title: string;
        description: string;
        fields: never[];
        submitLabel: string;
        successMessage: string;
    };
    typical: Record<string, unknown>;
    stress: {
        fields: {
            key: string;
            label: string;
            type: string;
            placeholder: string;
            required: boolean;
        }[];
    };
};
