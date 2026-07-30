
export type LinkCategory = "CONTACT" | "BUSINESS" | "SOCIAL_MEDIA" | "PAYMENT" | "MUSIC" | "OTHER";

export interface LinkTypeDef {
  type: string;
  label: string;
  category: LinkCategory;
  iconName: string;
  iconSvg?: string;
  placeholder?: string;
  tier?: "free" | "pro";
  color?: string;
}

export const LINK_CATALOG: LinkTypeDef[] = [
  {
    "type": "phone",
    "label": "Phone",
    "category": "CONTACT",
    "placeholder": "+8801XXXXXXXXX",
    "color": "#10B981",
    "iconName": "Phone"
  },
  {
    "type": "email",
    "label": "Email",
    "category": "CONTACT",
    "placeholder": "you@example.com",
    "color": "#6366F1",
    "iconName": "AtSign"
  },
  {
    "type": "whatsapp",
    "label": "WhatsApp",
    "category": "CONTACT",
    "placeholder": "https://wa.me/...",
    "color": "#25D366",
    "iconName": "SiWhatsapp"
  },
  {
    "type": "sms",
    "label": "SMS",
    "category": "CONTACT",
    "placeholder": "+8801XXXXXXXXX",
    "color": "#3B82F6",
    "iconName": "MessageCircle"
  },
  {
    "type": "messenger",
    "label": "Messenger",
    "category": "CONTACT",
    "placeholder": "https://m.me/...",
    "color": "#0084FF",
    "iconName": "SiMessenger"
  },
  {
    "type": "signal",
    "label": "Signal",
    "category": "CONTACT",
    "placeholder": "https://signal.me/...",
    "color": "#3A76F0",
    "iconName": "SiSignal"
  },
  {
    "type": "viber",
    "label": "Viber",
    "category": "CONTACT",
    "placeholder": "viber://chat?number=...",
    "color": "#7360F2",
    "iconName": "SiViber"
  },
  {
    "type": "wechat",
    "label": "WeChat",
    "category": "CONTACT",
    "placeholder": "WeChat ID",
    "color": "#07C160",
    "iconName": "SiWechat"
  },
  {
    "type": "address",
    "label": "Address",
    "category": "CONTACT",
    "placeholder": "Your address",
    "color": "#F43F5E",
    "iconName": "MapPin"
  },
  {
    "type": "calendar",
    "label": "Book a call",
    "category": "CONTACT",
    "placeholder": "https://cal.com/...",
    "color": "#8B5CF6",
    "iconName": "Calendar"
  },
  {
    "type": "website",
    "label": "Website",
    "category": "BUSINESS",
    "placeholder": "https://...",
    "color": "#6366F1",
    "iconName": "Globe"
  },
  {
    "type": "portfolio",
    "label": "Portfolio",
    "category": "BUSINESS",
    "placeholder": "https://...",
    "color": "#F59E0B",
    "iconName": "Briefcase"
  },
  {
    "type": "resume",
    "label": "Resume / CV",
    "category": "BUSINESS",
    "placeholder": "https://.../resume.pdf",
    "color": "#14B8A6",
    "iconName": "FileText"
  },
  {
    "type": "maps",
    "label": "Google Maps",
    "category": "BUSINESS",
    "placeholder": "https://maps.google.com/...",
    "color": "#4285F4",
    "iconName": "SiGooglemaps"
  },
  {
    "type": "reviews",
    "label": "Reviews",
    "category": "BUSINESS",
    "placeholder": "https://g.page/...",
    "color": "#EAB308",
    "iconName": "Star"
  },
  {
    "type": "store",
    "label": "Store / Shop",
    "category": "BUSINESS",
    "placeholder": "https://...",
    "color": "#EC4899",
    "iconName": "Store"
  },
  {
    "type": "download",
    "label": "Download",
    "category": "BUSINESS",
    "placeholder": "https://...",
    "color": "#6366F1",
    "iconName": "Download"
  },
  {
    "type": "custom",
    "label": "Custom Link",
    "category": "BUSINESS",
    "placeholder": "https://...",
    "color": "#64748B",
    "iconName": "Link2"
  },
  {
    "type": "linkedin",
    "label": "LinkedIn",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://linkedin.com/in/...",
    "color": "#0077B5",
    "iconName": "FaLinkedin"
  },
  {
    "type": "facebook",
    "label": "Facebook",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://facebook.com/...",
    "color": "#1877F2",
    "iconName": "SiFacebook"
  },
  {
    "type": "instagram",
    "label": "Instagram",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://instagram.com/...",
    "color": "#E4405F",
    "iconName": "SiInstagram"
  },
  {
    "type": "x",
    "label": "X.com",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://x.com/...",
    "color": "#333333",
    "iconName": "SiX"
  },
  {
    "type": "youtube",
    "label": "YouTube",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://youtube.com/@...",
    "color": "#FF0000",
    "iconName": "SiYoutube"
  },
  {
    "type": "tiktok",
    "label": "TikTok",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://tiktok.com/@...",
    "color": "#333333",
    "iconName": "SiTiktok"
  },
  {
    "type": "telegram",
    "label": "Telegram",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://t.me/...",
    "color": "#0088CC",
    "iconName": "SiTelegram"
  },
  {
    "type": "snapchat",
    "label": "Snapchat",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://snapchat.com/add/...",
    "color": "#E6E200",
    "iconName": "SiSnapchat"
  },
  {
    "type": "pinterest",
    "label": "Pinterest",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://pinterest.com/...",
    "color": "#E60023",
    "iconName": "SiPinterest"
  },
  {
    "type": "threads",
    "label": "Threads",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://threads.net/@...",
    "color": "#333333",
    "iconName": "SiThreads"
  },
  {
    "type": "reddit",
    "label": "Reddit",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://reddit.com/u/...",
    "color": "#FF4500",
    "iconName": "SiReddit"
  },
  {
    "type": "discord",
    "label": "Discord",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://discord.gg/...",
    "color": "#5865F2",
    "iconName": "SiDiscord"
  },
  {
    "type": "twitch",
    "label": "Twitch",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://twitch.tv/...",
    "color": "#9146FF",
    "iconName": "SiTwitch"
  },
  {
    "type": "github",
    "label": "GitHub",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://github.com/...",
    "color": "#333333",
    "iconName": "SiGithub"
  },
  {
    "type": "behance",
    "label": "Behance",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://behance.net/...",
    "color": "#1769FF",
    "iconName": "SiBehance"
  },
  {
    "type": "dribbble",
    "label": "Dribbble",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://dribbble.com/...",
    "color": "#EA4C89",
    "iconName": "SiDribbble"
  },
  {
    "type": "medium",
    "label": "Medium",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://medium.com/@...",
    "color": "#333333",
    "iconName": "SiMedium"
  },
  {
    "type": "vimeo",
    "label": "Vimeo",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://vimeo.com/...",
    "color": "#1AB7EA",
    "iconName": "SiVimeo"
  },
  {
    "type": "paypal",
    "label": "PayPal",
    "category": "PAYMENT",
    "placeholder": "https://paypal.me/...",
    "color": "#00457C",
    "iconName": "SiPaypal"
  },
  {
    "type": "cashapp",
    "label": "Cash App",
    "category": "PAYMENT",
    "placeholder": "$cashtag",
    "color": "#00D632",
    "iconName": "SiCashapp"
  },
  {
    "type": "venmo",
    "label": "Venmo",
    "category": "PAYMENT",
    "placeholder": "https://venmo.com/...",
    "color": "#008CFF",
    "iconName": "SiVenmo"
  },
  {
    "type": "stripe",
    "label": "Stripe",
    "category": "PAYMENT",
    "placeholder": "https://buy.stripe.com/...",
    "tier": "pro",
    "color": "#635BFF",
    "iconName": "SiStripe"
  },
  {
    "type": "payoneer",
    "label": "Payoneer",
    "category": "PAYMENT",
    "placeholder": "https://payoneer.com/...",
    "tier": "pro",
    "color": "#FF4800",
    "iconName": "SiPayoneer"
  },
  {
    "type": "wise",
    "label": "Wise",
    "category": "PAYMENT",
    "placeholder": "https://wise.com/...",
    "tier": "pro",
    "color": "#9FE870",
    "iconName": "SiWise"
  },
  {
    "type": "patreon",
    "label": "Patreon",
    "category": "PAYMENT",
    "placeholder": "https://patreon.com/...",
    "color": "#FF424D",
    "iconName": "SiPatreon"
  },
  {
    "type": "buymeacoffee",
    "label": "Buy Me a Coffee",
    "category": "PAYMENT",
    "placeholder": "https://buymeacoffee.com/...",
    "color": "#FFDD00",
    "iconName": "SiBuymeacoffee"
  },
  {
    "type": "gofundme",
    "label": "GoFundMe",
    "category": "PAYMENT",
    "placeholder": "https://gofundme.com/...",
    "color": "#00B964",
    "iconName": "SiGofundme"
  },
  {
    "type": "crypto",
    "label": "Crypto Wallet",
    "category": "PAYMENT",
    "placeholder": "Wallet address",
    "tier": "pro",
    "color": "#F7931A",
    "iconName": "Banknote"
  },
  {
    "type": "spotify",
    "label": "Spotify",
    "category": "MUSIC",
    "placeholder": "https://open.spotify.com/...",
    "color": "#1DB954",
    "iconName": "SiSpotify"
  },
  {
    "type": "applemusic",
    "label": "Apple Music",
    "category": "MUSIC",
    "placeholder": "https://music.apple.com/...",
    "color": "#FA243C",
    "iconName": "SiApplemusic"
  },
  {
    "type": "soundcloud",
    "label": "SoundCloud",
    "category": "MUSIC",
    "placeholder": "https://soundcloud.com/...",
    "color": "#FF3300",
    "iconName": "SiSoundcloud"
  },
  {
    "type": "youtubemusic",
    "label": "YouTube Music",
    "category": "MUSIC",
    "placeholder": "https://music.youtube.com/...",
    "color": "#FF0000",
    "iconName": "SiYoutubemusic"
  },
  {
    "type": "deezer",
    "label": "Deezer",
    "category": "MUSIC",
    "placeholder": "https://deezer.com/...",
    "color": "#EF5466",
    "iconName": "SiDeezer"
  },
  {
    "type": "bandcamp",
    "label": "Bandcamp",
    "category": "MUSIC",
    "placeholder": "https://bandcamp.com/...",
    "color": "#629AA9",
    "iconName": "SiBandcamp"
  },
  {
    "type": "audiomack",
    "label": "Audiomack",
    "category": "MUSIC",
    "placeholder": "https://audiomack.com/...",
    "color": "#FFA200",
    "iconName": "SiAudiomack"
  },
  {
    "type": "linktree",
    "label": "Linktree",
    "category": "OTHER",
    "placeholder": "https://linktr.ee/...",
    "color": "#43E660",
    "iconName": "SiLinktree"
  }
];

export const LINK_CATEGORIES: { id: LinkCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "CONTACT", label: "Contact" },
  { id: "BUSINESS", label: "Business" },
  { id: "SOCIAL_MEDIA", label: "Social media" },
  { id: "PAYMENT", label: "Payment" },
  { id: "MUSIC", label: "Music" },
];

const LINK_BY_TYPE = new Map(LINK_CATALOG.map((l) => [l.type, l]));

export function linkDef(type: string): LinkTypeDef | undefined {
  return LINK_BY_TYPE.get(type.toLowerCase());
}

export function linkLabel(type: string): string {
  return linkDef(type)?.label ?? type.charAt(0).toUpperCase() + type.slice(1);
}

export function isProOnlyLinkType(type: string): boolean {
  return linkDef(type)?.tier === "pro";
}
