"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIDGET_RENDERERS = void 0;
const appointment_1 = require("./widgets/appointment");
const business_hours_1 = require("./widgets/business-hours");
const contact_links_1 = require("./widgets/contact-links");
const cta_button_1 = require("./widgets/cta-button");
const faq_1 = require("./widgets/faq");
const gallery_1 = require("./widgets/gallery");
const lead_form_1 = require("./widgets/lead-form");
const profile_1 = require("./widgets/profile");
const rich_text_1 = require("./widgets/rich-text");
const service_list_1 = require("./widgets/service-list");
const testimonials_1 = require("./widgets/testimonials");
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
    CONTACT_LINKS: contact_links_1.ContactLinksRender,
    RICH_TEXT: rich_text_1.RichTextRender,
    SERVICE_LIST: service_list_1.ServiceListRender,
    GALLERY: gallery_1.GalleryRender,
    FAQ: faq_1.FaqRender,
    TESTIMONIALS: testimonials_1.TestimonialsRender,
    BUSINESS_HOURS: business_hours_1.BusinessHoursRender,
    APPOINTMENT: appointment_1.AppointmentRender,
    LEAD_FORM: lead_form_1.LeadFormRender,
    CTA_BUTTON: cta_button_1.CtaButtonRender,
};
