import { AppointmentRender } from './widgets/appointment';
import { BusinessHoursRender } from './widgets/business-hours';
import { ContactLinksRender } from './widgets/contact-links';
import { CtaButtonRender } from './widgets/cta-button';
import { FaqRender } from './widgets/faq';
import { GalleryRender } from './widgets/gallery';
import { LeadFormRender } from './widgets/lead-form';
import { ProfileRender } from './widgets/profile';
import { RichTextRender } from './widgets/rich-text';
import { ServiceListRender } from './widgets/service-list';
import { TestimonialsRender } from './widgets/testimonials';
/**
 * Widget renderers, keyed by type.
 *
 * Every one of these emits ONLY `cls('part')` class names and `data-*` hooks —
 * no Tailwind, no inline styles, no colours. All appearance comes from the
 * admin's `partStyles`, compiled to CSS. That is what lets a single widget
 * component look completely different in every template.
 */
export declare const WIDGET_RENDERERS: {
    PROFILE: typeof ProfileRender;
    CONTACT_LINKS: typeof ContactLinksRender;
    RICH_TEXT: typeof RichTextRender;
    SERVICE_LIST: typeof ServiceListRender;
    GALLERY: typeof GalleryRender;
    FAQ: typeof FaqRender;
    TESTIMONIALS: typeof TestimonialsRender;
    BUSINESS_HOURS: typeof BusinessHoursRender;
    APPOINTMENT: typeof AppointmentRender;
    LEAD_FORM: typeof LeadFormRender;
    CTA_BUTTON: typeof CtaButtonRender;
};
export type WidgetRendererType = keyof typeof WIDGET_RENDERERS;
export type { WidgetRenderProps } from './widgets/shared';
