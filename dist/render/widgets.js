"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIDGET_RENDERERS = void 0;
const appointment_1 = require("./widgets/appointment");
const business_hours_1 = require("./widgets/business-hours");
const connect_buttons_1 = require("./widgets/connect-buttons");
const contact_links_1 = require("./widgets/contact-links");
const copyright_1 = require("./widgets/copyright");
const cta_button_1 = require("./widgets/cta-button");
const description_1 = require("./widgets/description");
const divider_1 = require("./widgets/divider");
const embed_1 = require("./widgets/embed");
const faq_1 = require("./widgets/faq");
const gallery_1 = require("./widgets/gallery");
const icon_1 = require("./widgets/icon");
const icon_box_1 = require("./widgets/icon-box");
const image_1 = require("./widgets/image");
const lead_form_1 = require("./widgets/lead-form");
const map_1 = require("./widgets/map");
const price_list_1 = require("./widgets/price-list");
const profile_1 = require("./widgets/profile");
const rich_text_1 = require("./widgets/rich-text");
const service_list_1 = require("./widgets/service-list");
const social_icons_1 = require("./widgets/social-icons");
const spacer_1 = require("./widgets/spacer");
const stats_1 = require("./widgets/stats");
const team_1 = require("./widgets/team");
const testimonials_1 = require("./widgets/testimonials");
const timeline_1 = require("./widgets/timeline");
const title_1 = require("./widgets/title");
const video_1 = require("./widgets/video");
const video_gallery_1 = require("./widgets/video-gallery");
/**
 * Widget renderers, keyed by type.
 *
 * Every one of these emits ONLY `cls('part')` class names and `data-*` hooks —
 * no Tailwind, no inline styles, no colours. All appearance comes from the
 * admin's `partStyles`, compiled to CSS. That is what lets a single widget
 * component look completely different in every template.
 */
exports.WIDGET_RENDERERS = {
    PROFILE: profile_1.ProfileRender,
    CONNECT_BUTTONS: connect_buttons_1.ConnectButtonsRender,
    CONTACT_LINKS: contact_links_1.ContactLinksRender,
    LINKS: contact_links_1.ContactLinksRender,
    LINK_BUTTONS: contact_links_1.ContactLinksRender,
    CUSTOM_LINKS: contact_links_1.ContactLinksRender,
    COPYRIGHT: copyright_1.CopyrightRender,
    TITLE: title_1.TitleRender,
    DESCRIPTION: description_1.DescriptionRender,
    RICH_TEXT: rich_text_1.RichTextRender,
    IMAGE: image_1.ImageRender,
    ICON: icon_1.IconRender,
    ICON_BOX: icon_box_1.IconBoxRender,
    SERVICE_LIST: service_list_1.ServiceListRender,
    GALLERY: gallery_1.GalleryRender,
    FAQ: faq_1.FaqRender,
    TESTIMONIALS: testimonials_1.TestimonialsRender,
    BUSINESS_HOURS: business_hours_1.BusinessHoursRender,
    APPOINTMENT: appointment_1.AppointmentRender,
    LEAD_FORM: lead_form_1.LeadFormRender,
    CTA_BUTTON: cta_button_1.CtaButtonRender,
    SOCIAL_ICONS: social_icons_1.SocialIconsRender,
    VIDEO: video_1.VideoRender,
    VIDEO_GALLERY: video_gallery_1.VideoGalleryRender,
    EMBED: embed_1.EmbedRender,
    MAP: map_1.MapRender,
    STATS: stats_1.StatsRender,
    TIMELINE: timeline_1.TimelineRender,
    PRICE_LIST: price_list_1.PriceListRender,
    TEAM: team_1.TeamRender,
    SPACER: spacer_1.SpacerRender,
    DIVIDER: divider_1.DividerRender,
    SHARE_BUTTON: cta_button_1.CtaButtonRender,
    VCARD_BUTTON: cta_button_1.CtaButtonRender,
    QR_CODE: icon_1.IconRender,
};
