import { AppointmentRender } from './widgets/appointment';
import { BusinessHoursRender } from './widgets/business-hours';
import { ContactLinksRender } from './widgets/contact-links';
import { CtaButtonRender } from './widgets/cta-button';
import { DescriptionRender } from './widgets/description';
import { DividerRender } from './widgets/divider';
import { EmbedRender } from './widgets/embed';
import { FaqRender } from './widgets/faq';
import { GalleryRender } from './widgets/gallery';
import { IconRender } from './widgets/icon';
import { IconBoxRender } from './widgets/icon-box';
import { ImageRender } from './widgets/image';
import { LeadFormRender } from './widgets/lead-form';
import { MapRender } from './widgets/map';
import { PriceListRender } from './widgets/price-list';
import { ProfileRender } from './widgets/profile';
import { RichTextRender } from './widgets/rich-text';
import { ServiceListRender } from './widgets/service-list';
import { SocialIconsRender } from './widgets/social-icons';
import { SpacerRender } from './widgets/spacer';
import { StatsRender } from './widgets/stats';
import { TeamRender } from './widgets/team';
import { TestimonialsRender } from './widgets/testimonials';
import { TimelineRender } from './widgets/timeline';
import { TitleRender } from './widgets/title';
import { VideoRender } from './widgets/video';
import { VideoGalleryRender } from './widgets/video-gallery';
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
    TITLE: typeof TitleRender;
    DESCRIPTION: typeof DescriptionRender;
    RICH_TEXT: typeof RichTextRender;
    IMAGE: typeof ImageRender;
    ICON: typeof IconRender;
    ICON_BOX: typeof IconBoxRender;
    SERVICE_LIST: typeof ServiceListRender;
    GALLERY: typeof GalleryRender;
    FAQ: typeof FaqRender;
    TESTIMONIALS: typeof TestimonialsRender;
    BUSINESS_HOURS: typeof BusinessHoursRender;
    APPOINTMENT: typeof AppointmentRender;
    LEAD_FORM: typeof LeadFormRender;
    CTA_BUTTON: typeof CtaButtonRender;
    SOCIAL_ICONS: typeof SocialIconsRender;
    VIDEO: typeof VideoRender;
    VIDEO_GALLERY: typeof VideoGalleryRender;
    EMBED: typeof EmbedRender;
    MAP: typeof MapRender;
    STATS: typeof StatsRender;
    TIMELINE: typeof TimelineRender;
    PRICE_LIST: typeof PriceListRender;
    TEAM: typeof TeamRender;
    SPACER: typeof SpacerRender;
    DIVIDER: typeof DividerRender;
};
export type WidgetRendererType = keyof typeof WIDGET_RENDERERS;
export type { WidgetRenderProps } from './widgets/shared';
