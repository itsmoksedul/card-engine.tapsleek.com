"use strict";
/**
 * Widget registry — the one file that grows when you add a widget.
 *
 * Everything else derives from here:
 *   • the builder palette            (`manifest()` → GET /admin/widgets)
 *   • content validation             (`schemaToZod(meta.contentSchema)`)
 *   • publish-time template linting
 *   • lazy content migration         (`migrations`)
 *   • the generic widget test suite   (`previews`)
 *
 * A widget type is NEVER removed — a template somewhere still references it.
 * Retire one with `meta.deprecated` instead: hidden from the palette, still
 * renders, flagged as a warning on publish.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIDGET_ALIASES = exports.WIDGET_TYPES = void 0;
exports.normalizeWidgetType = normalizeWidgetType;
exports.getWidget = getWidget;
exports.getWidgetMeta = getWidgetMeta;
exports.hasWidget = hasWidget;
exports.manifest = manifest;
exports.paletteManifest = paletteManifest;
exports.interactiveTypes = interactiveTypes;
exports.derivedTypes = derivedTypes;
exports.partKeys = partKeys;
const Appointment = __importStar(require("./appointment"));
const BusinessHours = __importStar(require("./business-hours"));
const ConnectButtons = __importStar(require("./connect-buttons"));
const ContactLinks = __importStar(require("./contact-links"));
const Copyright = __importStar(require("./copyright"));
const CtaButton = __importStar(require("./cta-button"));
const Description = __importStar(require("./description"));
const Divider = __importStar(require("./divider"));
const Embed = __importStar(require("./embed"));
const Faq = __importStar(require("./faq"));
const FeatureGrid = __importStar(require("./feature-grid"));
const Gallery = __importStar(require("./gallery"));
const Icon = __importStar(require("./icon"));
const IconBox = __importStar(require("./icon-box"));
const ImageWidget = __importStar(require("./image"));
const LeadForm = __importStar(require("./lead-form"));
const LogoWall = __importStar(require("./logo-wall"));
const MapWidget = __importStar(require("./map"));
const PriceList = __importStar(require("./price-list"));
const Profile = __importStar(require("./profile"));
const QrCode = __importStar(require("./qr-code"));
const RichText = __importStar(require("./rich-text"));
const ServiceList = __importStar(require("./service-list"));
const ShareButton = __importStar(require("./share-button"));
const SocialIcons = __importStar(require("./social-icons"));
const Spacer = __importStar(require("./spacer"));
const Stats = __importStar(require("./stats"));
const Team = __importStar(require("./team"));
const Testimonials = __importStar(require("./testimonials"));
const Timeline = __importStar(require("./timeline"));
const Title = __importStar(require("./title"));
const VcardButton = __importStar(require("./vcard-button"));
const Video = __importStar(require("./video"));
const VideoGallery = __importStar(require("./video-gallery"));
const MODULES = [
    // System widgets (Header & Footer)
    Profile,
    ConnectButtons,
    ContactLinks,
    Copyright,
    // Active content widgets
    Title,
    Description,
    ImageWidget,
    Icon,
    Video,
    ServiceList,
    Gallery,
    MapWidget,
    CtaButton,
    Embed,
    Spacer,
];
// Keep legacy widgets in lookup map so existing cards continue to render safely
const ALL_MODULES = [
    ...MODULES,
    Appointment,
    BusinessHours,
    Faq,
    FeatureGrid,
    IconBox,
    LeadForm,
    LogoWall,
    PriceList,
    QrCode,
    RichText,
    ShareButton,
    SocialIcons,
    Stats,
    Team,
    Testimonials,
    Timeline,
    VcardButton,
    VideoGallery,
    Divider,
];
const BY_TYPE = new Map(ALL_MODULES.map((m) => [m.meta.type, m]));
/** Every registered type, in palette order. */
exports.WIDGET_TYPES = MODULES.map((m) => m.meta.type);
exports.WIDGET_ALIASES = {
    MAPS: 'MAP',
    HOURS: 'BUSINESS_HOURS',
    REVIEWS: 'TESTIMONIALS',
    BUTTON: 'CTA_BUTTON',
    SOCIAL_ICON: 'SOCIAL_ICONS',
    HR: 'DIVIDER',
    SPACE: 'SPACER',
    HTML_EMBED: 'EMBED',
    VCARD: 'VCARD_BUTTON',
    LINKS: 'CONTACT_LINKS',
};
function normalizeWidgetType(type) {
    const upper = (type || '').toUpperCase();
    return exports.WIDGET_ALIASES[upper] || upper;
}
function getWidget(type) {
    const norm = normalizeWidgetType(type);
    return BY_TYPE.get(norm) ?? BY_TYPE.get(type);
}
function getWidgetMeta(type) {
    const norm = normalizeWidgetType(type);
    return BY_TYPE.get(norm)?.meta ?? BY_TYPE.get(type)?.meta;
}
function hasWidget(type) {
    const norm = normalizeWidgetType(type);
    return BY_TYPE.has(norm) || BY_TYPE.has(type);
}
/**
 * JSON-safe descriptor list. This is what the builder palette renders and what
 * the backend validates against — one source of truth, so the two cannot drift.
 */
function manifest() {
    return MODULES.map((m) => m.meta);
}
/** Palette listing: deprecated widgets are hidden from new placements. */
function paletteManifest() {
    return manifest().filter((m) => !m.deprecated);
}
/** Widget types that need client JS — used to keep static cards JS-free. */
function interactiveTypes() {
    return manifest()
        .filter((m) => m.interactive)
        .map((m) => m.type);
}
/** Widgets whose content is derived from card data rather than stored. */
function derivedTypes() {
    return manifest()
        .filter((m) => m.derived)
        .map((m) => m.type);
}
/** Every part key a widget declares — used to reject dead `partStyles`. */
function partKeys(type) {
    return getWidgetMeta(type)?.parts?.map((p) => p.key) ?? [];
}
