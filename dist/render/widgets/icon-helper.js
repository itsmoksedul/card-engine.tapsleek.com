"use strict";
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
exports.RenderIcon = RenderIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const LucideIcons = __importStar(require("lucide-react"));
const fa_1 = require("react-icons/fa");
const links_1 = require("../../catalog/links");
const si_1 = require("react-icons/si");
const SI_MAP = {
    SiAnthropic: si_1.SiAnthropic, SiApplemusic: si_1.SiApplemusic, SiApplepodcasts: si_1.SiApplepodcasts, SiAppstore: si_1.SiAppstore, SiArtstation: si_1.SiArtstation, SiAudiomack: si_1.SiAudiomack, SiBandcamp: si_1.SiBandcamp, SiBehance: si_1.SiBehance, SiBinance: si_1.SiBinance, SiBitbucket: si_1.SiBitbucket, SiBluesky: si_1.SiBluesky, SiBox: si_1.SiBox, SiBuymeacoffee: si_1.SiBuymeacoffee, SiCalendly: si_1.SiCalendly, SiCashapp: si_1.SiCashapp, SiCoinbase: si_1.SiCoinbase, SiCrunchbase: si_1.SiCrunchbase, SiDeezer: si_1.SiDeezer, SiDevdotto: si_1.SiDevdotto, SiDiscord: si_1.SiDiscord, SiDocker: si_1.SiDocker, SiDribbble: si_1.SiDribbble, SiDropbox: si_1.SiDropbox, SiEtsy: si_1.SiEtsy, SiFacebook: si_1.SiFacebook, SiFigma: si_1.SiFigma, SiFiverr: si_1.SiFiverr, SiFlickr: si_1.SiFlickr, SiFramer: si_1.SiFramer, SiFreelancer: si_1.SiFreelancer, SiG2: si_1.SiG2, SiGhost: si_1.SiGhost, SiGithub: si_1.SiGithub, SiGithubsponsors: si_1.SiGithubsponsors, SiGitlab: si_1.SiGitlab, SiGofundme: si_1.SiGofundme, SiGoogle: si_1.SiGoogle, SiGooglechat: si_1.SiGooglechat, SiGoogledocs: si_1.SiGoogledocs, SiGoogledrive: si_1.SiGoogledrive, SiGooglemaps: si_1.SiGooglemaps, SiGooglemeet: si_1.SiGooglemeet, SiGoogleplay: si_1.SiGoogleplay, SiGooglesheets: si_1.SiGooglesheets, SiGoogleslides: si_1.SiGoogleslides, SiGumroad: si_1.SiGumroad, SiHashnode: si_1.SiHashnode, SiHuggingface: si_1.SiHuggingface, SiIcloud: si_1.SiIcloud, SiInstagram: si_1.SiInstagram, SiKakaotalk: si_1.SiKakaotalk, SiKofi: si_1.SiKofi, SiLine: si_1.SiLine, SiLinktree: si_1.SiLinktree, SiMastodon: si_1.SiMastodon, SiMedium: si_1.SiMedium, SiMega: si_1.SiMega, SiMessenger: si_1.SiMessenger, SiNpm: si_1.SiNpm, SiOpencollective: si_1.SiOpencollective, SiPatreon: si_1.SiPatreon, SiPayoneer: si_1.SiPayoneer, SiPaypal: si_1.SiPaypal, SiPerplexity: si_1.SiPerplexity, SiPinterest: si_1.SiPinterest, SiPixiv: si_1.SiPixiv, SiProducthunt: si_1.SiProducthunt, SiReddit: si_1.SiReddit, SiReplit: si_1.SiReplit, SiRevolut: si_1.SiRevolut, SiSellfy: si_1.SiSellfy, SiShopify: si_1.SiShopify, SiSignal: si_1.SiSignal, SiSnapchat: si_1.SiSnapchat, SiSoundcloud: si_1.SiSoundcloud, SiSpotify: si_1.SiSpotify, SiStackoverflow: si_1.SiStackoverflow, SiStripe: si_1.SiStripe, SiSubstack: si_1.SiSubstack, SiTelegram: si_1.SiTelegram, SiThreads: si_1.SiThreads, SiTidal: si_1.SiTidal, SiTiktok: si_1.SiTiktok, SiTripadvisor: si_1.SiTripadvisor, SiTrustpilot: si_1.SiTrustpilot, SiTwitch: si_1.SiTwitch, SiUpwork: si_1.SiUpwork, SiVenmo: si_1.SiVenmo, SiViber: si_1.SiViber, SiVimeo: si_1.SiVimeo, SiWechat: si_1.SiWechat, SiWetransfer: si_1.SiWetransfer, SiWhatsapp: si_1.SiWhatsapp, SiWise: si_1.SiWise, SiWoocommerce: si_1.SiWoocommerce, SiX: si_1.SiX, SiYelp: si_1.SiYelp, SiYoutube: si_1.SiYoutube, SiYoutubemusic: si_1.SiYoutubemusic, SiZoom: si_1.SiZoom
};
const COMMON_ICON_MAP = {
    PHONE: "Phone",
    EMAIL: "Mail",
    MAIL: "Mail",
    WEBSITE: "Globe",
    WHATSAPP: "MessageSquare",
    LOCATION: "MapPin",
    ADDRESS: "MapPin",
    TELEGRAM: "Send",
    LINKEDIN: "Linkedin",
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
    TWITTER: "Twitter",
    YOUTUBE: "Youtube",
    TIKTOK: "Video",
    GITHUB: "Github",
    SAVE_CONTACT: "UserPlus",
    CONNECT_NOW: "Send",
    SHARE: "Share2",
    QR: "QrCode",
};
function RenderIcon({ name, className, }) {
    if (!name)
        return null;
    let iconValue = name;
    if (typeof name === "string") {
        const def = (0, links_1.linkDef)(name);
        if (def && def.iconSvg) {
            return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": def.type, "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, dangerouslySetInnerHTML: { __html: def.iconSvg } }));
        }
        if (def && def.iconName) {
            iconValue = def.iconName;
        }
    }
    if (typeof iconValue === "object" && iconValue !== null) {
        if (iconValue.type === "svg" && iconValue.svg) {
            return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": iconValue.name ?? "custom", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, dangerouslySetInnerHTML: { __html: iconValue.svg } }));
        }
        if (iconValue.type === "url" && iconValue.url) {
            return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": iconValue.name ?? "custom-url", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, children: (0, jsx_runtime_1.jsx)("img", { src: iconValue.url, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) }));
        }
        if (iconValue.type === "react-icon" && iconValue.name) {
            iconValue = iconValue.name;
        }
        else {
            return null;
        }
    }
    const upper = String(iconValue).trim().toUpperCase();
    const mapped = COMMON_ICON_MAP[upper] ?? iconValue;
    const formatted = String(mapped)
        .split(/[-_ ]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    // Check SI Map first
    let IconComponent = null;
    if (formatted === "FaLinkedin") {
        IconComponent = fa_1.FaLinkedin;
    }
    else if (formatted.startsWith("Si") && SI_MAP[formatted]) {
        IconComponent = SI_MAP[formatted];
    }
    else {
        IconComponent =
            LucideIcons[formatted] ??
                LucideIcons[mapped] ??
                LucideIcons[upper] ??
                LucideIcons.Globe;
    }
    return ((0, jsx_runtime_1.jsx)("span", { className: className, "data-icon": String(iconValue), "aria-hidden": true, style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
        }, children: (0, jsx_runtime_1.jsx)(IconComponent, { style: { width: "1em", height: "1em", flexShrink: 0 } }) }));
}
