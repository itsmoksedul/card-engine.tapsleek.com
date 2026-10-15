import { jsx as _jsx } from "react/jsx-runtime";
import * as LucideIcons from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { linkDef } from "../../catalog/links";
import { sanitizeHtml } from "../sanitize";
import { SiAnthropic, SiApplemusic, SiApplepodcasts, SiAppstore, SiArtstation, SiAudiomack, SiBandcamp, SiBehance, SiBinance, SiBitbucket, SiBluesky, SiBox, SiBuymeacoffee, SiCalendly, SiCashapp, SiCoinbase, SiCrunchbase, SiDeezer, SiDevdotto, SiDiscord, SiDocker, SiDribbble, SiDropbox, SiEtsy, SiFacebook, SiFigma, SiFiverr, SiFlickr, SiFramer, SiFreelancer, SiG2, SiGhost, SiGithub, SiGithubsponsors, SiGitlab, SiGofundme, SiGoogle, SiGooglechat, SiGoogledocs, SiGoogledrive, SiGooglemaps, SiGooglemeet, SiGoogleplay, SiGooglesheets, SiGoogleslides, SiGumroad, SiHashnode, SiHuggingface, SiIcloud, SiInstagram, SiKakaotalk, SiKofi, SiLine, SiLinktree, SiMastodon, SiMedium, SiMega, SiMessenger, SiNpm, SiOpencollective, SiPatreon, SiPayoneer, SiPaypal, SiPerplexity, SiPinterest, SiPixiv, SiProducthunt, SiReddit, SiReplit, SiRevolut, SiSellfy, SiShopify, SiSignal, SiSnapchat, SiSoundcloud, SiSpotify, SiStackoverflow, SiStripe, SiSubstack, SiTelegram, SiThreads, SiTidal, SiTiktok, SiTripadvisor, SiTrustpilot, SiTwitch, SiUpwork, SiVenmo, SiViber, SiVimeo, SiWechat, SiWetransfer, SiWhatsapp, SiWise, SiWoocommerce, SiX, SiYelp, SiYoutube, SiYoutubemusic, SiZoom } from "react-icons/si";
const SI_MAP = {
    SiAnthropic, SiApplemusic, SiApplepodcasts, SiAppstore, SiArtstation, SiAudiomack, SiBandcamp, SiBehance, SiBinance, SiBitbucket, SiBluesky, SiBox, SiBuymeacoffee, SiCalendly, SiCashapp, SiCoinbase, SiCrunchbase, SiDeezer, SiDevdotto, SiDiscord, SiDocker, SiDribbble, SiDropbox, SiEtsy, SiFacebook, SiFigma, SiFiverr, SiFlickr, SiFramer, SiFreelancer, SiG2, SiGhost, SiGithub, SiGithubsponsors, SiGitlab, SiGofundme, SiGoogle, SiGooglechat, SiGoogledocs, SiGoogledrive, SiGooglemaps, SiGooglemeet, SiGoogleplay, SiGooglesheets, SiGoogleslides, SiGumroad, SiHashnode, SiHuggingface, SiIcloud, SiInstagram, SiKakaotalk, SiKofi, SiLine, SiLinktree, SiMastodon, SiMedium, SiMega, SiMessenger, SiNpm, SiOpencollective, SiPatreon, SiPayoneer, SiPaypal, SiPerplexity, SiPinterest, SiPixiv, SiProducthunt, SiReddit, SiReplit, SiRevolut, SiSellfy, SiShopify, SiSignal, SiSnapchat, SiSoundcloud, SiSpotify, SiStackoverflow, SiStripe, SiSubstack, SiTelegram, SiThreads, SiTidal, SiTiktok, SiTripadvisor, SiTrustpilot, SiTwitch, SiUpwork, SiVenmo, SiViber, SiVimeo, SiWechat, SiWetransfer, SiWhatsapp, SiWise, SiWoocommerce, SiX, SiYelp, SiYoutube, SiYoutubemusic, SiZoom
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
    CONNECT_NOW: "Send",
    SHARE: "Share2",
    QR: "QrCode",
    ARROW: "ArrowRight",
    CALENDAR: "Calendar",
    DOWNLOAD: "Download",
    EXTERNAL: "ExternalLink",
    EXTERNAL_LINK: "ExternalLink",
    CART: "ShoppingCart",
    MAP: "MapPin",
    STAR: "Star",
    GLOBE: "Globe",
    SEND: "Send",
    PLAY: "Play",
};
import { FaPhone, FaEnvelope, FaComment, FaMessage, FaLocationDot, FaVideo, FaUsers, FaCalendarDays, FaCalendar, FaGlobe, FaBriefcase, FaFileLines, FaStore, FaDownload, FaLink, FaBuilding, FaCloud, FaPaintbrush, FaCartShopping, FaCode, FaCamera, FaMoneyBill, FaWallet, FaQrcode, FaAddressCard, FaUserPlus, FaPaperPlane, FaShareNodes, FaArrowRight, FaArrowLeft, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCheck, FaXmark, FaPlus, FaMinus, FaCalendarCheck, FaClock, FaHandPointer, FaFont, FaAlignLeft, FaCircleQuestion, FaGrip, FaImages, FaCircleInfo, FaFaceSmile, FaImage, FaList, FaUser, FaTwitter, FaArrowsUpDown, FaChartBar, FaQuoteLeft, FaListOl, FaHeading, FaClapperboard } from "react-icons/fa6";
const FA_MAP = {
    Phone: FaPhone, Mail: FaEnvelope, AtSign: FaEnvelope, MessageCircle: FaComment,
    MessageSquare: FaMessage, MapPin: FaLocationDot, Video: FaVideo, Users: FaUsers,
    CalendarDays: FaCalendarDays, Calendar: FaCalendar, Globe: FaGlobe, Briefcase: FaBriefcase,
    FileText: FaFileLines, Store: FaStore, Download: FaDownload, Link2: FaLink,
    Building2: FaBuilding, Building: FaBuilding, Cloud: FaCloud, Paintbrush: FaPaintbrush,
    ShoppingCart: FaCartShopping, Code: FaCode, Camera: FaCamera, Banknote: FaMoneyBill,
    Wallet: FaWallet, QrCode: FaQrcode, Contact: FaAddressCard, UserPlus: FaUserPlus,
    Send: FaPaperPlane, Share2: FaShareNodes, Image: FaImage, User: FaUser,
    ArrowRight: FaArrowRight, ArrowLeft: FaArrowLeft, ChevronDown: FaChevronDown,
    ChevronUp: FaChevronUp, ChevronLeft: FaChevronLeft, ChevronRight: FaChevronRight,
    Check: FaCheck, X: FaXmark, Plus: FaPlus, Minus: FaMinus, CalendarCheck: FaCalendarCheck,
    Clock: FaClock, MousePointerClick: FaHandPointer, Type: FaFont, AlignLeft: FaAlignLeft,
    MessageCircleQuestion: FaCircleQuestion, LayoutGrid: FaGrip, Images: FaImages,
    BadgeInfo: FaCircleInfo, Smile: FaFaceSmile, List: FaList, Twitter: FaTwitter,
    MoveVertical: FaArrowsUpDown, BarChart: FaChartBar, Quote: FaQuoteLeft,
    ListOrdered: FaListOl, Heading: FaHeading, Clapperboard: FaClapperboard
};
export function RenderIcon({ name, className, }) {
    if (!name)
        return null;
    let iconValue = name;
    if (typeof name === "string") {
        if (name.trim().startsWith("<svg") || name.trim().startsWith("<?xml")) {
            return (_jsx("span", { className: className, "data-icon": "custom-svg", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, dangerouslySetInnerHTML: { __html: sanitizeHtml(name, "svg") } }));
        }
        const def = linkDef(name);
        if (def && def.iconSvg) {
            return (_jsx("span", { className: className, "data-icon": def.type, "aria-hidden": true, style: {
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
            return (_jsx("span", { className: className, "data-icon": iconValue.name ?? "custom", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, dangerouslySetInnerHTML: { __html: sanitizeHtml(iconValue.svg, "svg") } }));
        }
        if (iconValue.type === "url" && iconValue.url) {
            return (_jsx("span", { className: className, "data-icon": iconValue.name ?? "custom-url", "aria-hidden": true, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, children: _jsx("img", { src: iconValue.url, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) }));
        }
        if (iconValue.type === "react-icon" && iconValue.name) {
            // The icon picker stores react-icons export names ("LuDownload");
            // lucide-react exports the same glyph without the prefix.
            iconValue =
                (iconValue.set === "lu" || !iconValue.set) &&
                    /^Lu[A-Z0-9]/.test(iconValue.name)
                    ? iconValue.name.slice(2)
                    : iconValue.name;
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
    let isFilledIcon = false;
    if (formatted === "FaLinkedin") {
        IconComponent = FaLinkedin;
        isFilledIcon = true;
    }
    else if (formatted.startsWith("Si") && SI_MAP[formatted]) {
        IconComponent = SI_MAP[formatted];
        isFilledIcon = true;
    }
    else if (FA_MAP[formatted] || FA_MAP[mapped] || FA_MAP[upper]) {
        IconComponent = FA_MAP[formatted] ?? FA_MAP[mapped] ?? FA_MAP[upper];
        isFilledIcon = true;
    }
    else {
        IconComponent =
            LucideIcons[formatted] ??
                LucideIcons[mapped] ??
                LucideIcons[upper] ??
                LucideIcons.Link2;
    }
    return (_jsx("span", { className: className, "data-icon": formatted, "aria-hidden": true, style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
        }, children: _jsx(IconComponent, { style: { width: "1em", height: "1em", flexShrink: 0 }, ...(isFilledIcon ? { stroke: "none", strokeWidth: 0, fill: "currentColor" } : {}) }) }));
}
