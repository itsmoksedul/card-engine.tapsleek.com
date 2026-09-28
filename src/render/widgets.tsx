import { AppointmentRender } from './widgets/appointment';
import { BusinessHoursRender } from './widgets/business-hours';
import { ConnectButtonsRender } from './widgets/connect-buttons';
import { ContactLinksRender } from './widgets/contact-links';
import { CopyrightRender } from './widgets/copyright';
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
export const WIDGET_RENDERERS = {
  PROFILE: ProfileRender,
  CONNECT_BUTTONS: ConnectButtonsRender,
  CONTACT_LINKS: ContactLinksRender,
  LINKS: ContactLinksRender,
  LINK_BUTTONS: ContactLinksRender,
  CUSTOM_LINKS: ContactLinksRender,
  COPYRIGHT: CopyrightRender,
  TITLE: TitleRender,
  DESCRIPTION: DescriptionRender,
  RICH_TEXT: RichTextRender,
  IMAGE: ImageRender,
  ICON: IconRender,
  ICON_BOX: IconBoxRender,
  SERVICE_LIST: ServiceListRender,
  GALLERY: GalleryRender,
  FAQ: FaqRender,
  TESTIMONIALS: TestimonialsRender,
  BUSINESS_HOURS: BusinessHoursRender,
  APPOINTMENT: AppointmentRender,
  LEAD_FORM: LeadFormRender,
  CTA_BUTTON: CtaButtonRender,
  SOCIAL_ICONS: SocialIconsRender,
  VIDEO: VideoRender,
  VIDEO_GALLERY: VideoGalleryRender,
  EMBED: EmbedRender,
  MAP: MapRender,
  STATS: StatsRender,
  TIMELINE: TimelineRender,
  PRICE_LIST: PriceListRender,
  TEAM: TeamRender,
  SPACER: SpacerRender,
  DIVIDER: DividerRender,
  SHARE_BUTTON: CtaButtonRender,
  VCARD_BUTTON: CtaButtonRender,
  QR_CODE: IconRender,
};

export type WidgetRendererType = keyof typeof WIDGET_RENDERERS;
export type { WidgetRenderProps } from './widgets/shared';
