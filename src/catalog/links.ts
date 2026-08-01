
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
  prefix?: string;
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
    "placeholder": "Phone number",
    "prefix": "https://wa.me/",
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
    "placeholder": "username",
    "prefix": "https://m.me/",
    "color": "#0084FF",
    "iconName": "SiMessenger"
  },
  {
    "type": "signal",
    "label": "Signal",
    "category": "CONTACT",
    "placeholder": "Phone number",
    "prefix": "https://signal.me/#p/",
    "color": "#3A76F0",
    "iconName": "SiSignal"
  },
  {
    "type": "viber",
    "label": "Viber",
    "category": "CONTACT",
    "placeholder": "Phone number",
    "prefix": "viber://chat?number=",
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
    "type": "telegram",
    "label": "Telegram",
    "category": "CONTACT",
    "placeholder": "username",
    "prefix": "https://t.me/",
    "color": "#24A1DE",
    "iconName": "SiTelegram"
  },
  {
    "type": "line",
    "label": "LINE",
    "category": "CONTACT",
    "placeholder": "Phone number",
    "prefix": "https://line.me/ti/p/",
    "color": "#00C300",
    "iconName": "SiLine"
  },
  {
    "type": "kakaotalk",
    "label": "KakaoTalk",
    "category": "CONTACT",
    "placeholder": "Kakao ID",
    "color": "#FEE500",
    "iconName": "SiKakaotalk"
  },
  {
    "type": "qq",
    "label": "QQ",
    "category": "CONTACT",
    "placeholder": "QQ Number",
    "color": "#EB1923",
    "iconName": "MessageSquare"
  },
  {
    "type": "imo",
    "label": "IMO",
    "category": "CONTACT",
    "placeholder": "IMO Number",
    "color": "#0056B3",
    "iconName": "MessageSquare"
  },
  {
    "type": "facetime",
    "label": "FaceTime",
    "category": "CONTACT",
    "placeholder": "Apple ID or Phone Number",
    "color": "#34C759",
    "iconName": "Video"
  },
  {
    "type": "googlechat",
    "label": "Google Chat",
    "category": "CONTACT",
    "placeholder": "Email",
    "color": "#00897B",
    "iconName": "SiGooglechat"
  },
  {
    "type": "slack",
    "label": "Slack",
    "category": "CONTACT",
    "placeholder": "https://slack.com/...",
    "color": "#4A154B",
    "iconName": "MessageCircle"
  },
  {
    "type": "teams",
    "label": "Microsoft Teams",
    "category": "CONTACT",
    "placeholder": "https://teams.microsoft.com/...",
    "color": "#6264A7",
    "iconName": "Users"
  },
  {
    "type": "zoom",
    "label": "Zoom",
    "category": "CONTACT",
    "placeholder": "https://zoom.us/j/...",
    "color": "#2D8CFF",
    "iconName": "SiZoom"
  },
  {
    "type": "googlemeet",
    "label": "Google Meet",
    "category": "CONTACT",
    "placeholder": "https://meet.google.com/...",
    "color": "#00897B",
    "iconName": "SiGooglemeet"
  },
  {
    "type": "calendly",
    "label": "Calendly",
    "category": "CONTACT",
    "placeholder": "https://calendly.com/...",
    "color": "#006BFF",
    "iconName": "SiCalendly"
  },
  {
    "type": "caldotcom",
    "label": "Cal.com",
    "category": "CONTACT",
    "placeholder": "https://cal.com/...",
    "color": "#000000",
    "iconName": "CalendarDays"
  },
  {
    "type": "microsoftbookings",
    "label": "Microsoft Bookings",
    "category": "CONTACT",
    "placeholder": "https://outlook.office365.com/owa/calendar/...",
    "color": "#0078D4",
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
    "type": "googlebusiness",
    "label": "Google Business Profile",
    "category": "BUSINESS",
    "placeholder": "https://g.page/...",
    "color": "#4285F4",
    "iconName": "SiGoogle"
  },
  {
    "type": "yelp",
    "label": "Yelp",
    "category": "BUSINESS",
    "placeholder": "https://yelp.com/biz/...",
    "color": "#FF1A1A",
    "iconName": "SiYelp"
  },
  {
    "type": "trustpilot",
    "label": "Trustpilot",
    "category": "BUSINESS",
    "placeholder": "https://trustpilot.com/review/...",
    "color": "#00B67A",
    "iconName": "SiTrustpilot"
  },
  {
    "type": "clutch",
    "label": "Clutch",
    "category": "BUSINESS",
    "placeholder": "https://clutch.co/profile/...",
    "color": "#000000",
    "iconName": "Building2"
  },
  {
    "type": "g2",
    "label": "G2",
    "category": "BUSINESS",
    "placeholder": "https://g2.com/products/...",
    "color": "#FF492C",
    "iconName": "SiG2"
  },
  {
    "type": "capterra",
    "label": "Capterra",
    "category": "BUSINESS",
    "placeholder": "https://capterra.com/...",
    "color": "#000000",
    "iconName": "Building"
  },
  {
    "type": "tripadvisor",
    "label": "TripAdvisor",
    "category": "BUSINESS",
    "placeholder": "https://tripadvisor.com/...",
    "color": "#00AF87",
    "iconName": "SiTripadvisor"
  },
  {
    "type": "googledrive",
    "label": "Google Drive",
    "category": "BUSINESS",
    "placeholder": "https://drive.google.com/...",
    "color": "#4285F4",
    "iconName": "SiGoogledrive"
  },
  {
    "type": "dropbox",
    "label": "Dropbox",
    "category": "BUSINESS",
    "placeholder": "https://dropbox.com/...",
    "color": "#0061FF",
    "iconName": "SiDropbox"
  },
  {
    "type": "onedrive",
    "label": "OneDrive",
    "category": "BUSINESS",
    "placeholder": "https://onedrive.live.com/...",
    "color": "#0078D4",
    "iconName": "Cloud"
  },
  {
    "type": "googledocs",
    "label": "Google Docs",
    "category": "BUSINESS",
    "placeholder": "https://docs.google.com/...",
    "color": "#4285F4",
    "iconName": "SiGoogledocs"
  },
  {
    "type": "googlesheets",
    "label": "Google Sheets",
    "category": "BUSINESS",
    "placeholder": "https://docs.google.com/spreadsheets/...",
    "color": "#34A853",
    "iconName": "SiGooglesheets"
  },
  {
    "type": "googleslides",
    "label": "Google Slides",
    "category": "BUSINESS",
    "placeholder": "https://docs.google.com/presentation/...",
    "color": "#FBBC04",
    "iconName": "SiGoogleslides"
  },
  {
    "type": "figma",
    "label": "Figma",
    "category": "BUSINESS",
    "placeholder": "https://figma.com/...",
    "color": "#F24E1E",
    "iconName": "SiFigma"
  },
  {
    "type": "framer",
    "label": "Framer",
    "category": "BUSINESS",
    "placeholder": "https://framer.com/...",
    "color": "#0055FF",
    "iconName": "SiFramer"
  },
  {
    "type": "canva",
    "label": "Canva",
    "category": "BUSINESS",
    "placeholder": "https://canva.com/...",
    "color": "#00C4CC",
    "iconName": "Paintbrush"
  },
  {
    "type": "adobeportfolio",
    "label": "Adobe Portfolio",
    "category": "BUSINESS",
    "placeholder": "https://portfolio.adobe.com/...",
    "color": "#000000",
    "iconName": "Briefcase"
  },
  {
    "type": "producthunt",
    "label": "Product Hunt",
    "category": "BUSINESS",
    "placeholder": "https://producthunt.com/...",
    "color": "#DA552F",
    "iconName": "SiProducthunt"
  },
  {
    "type": "crunchbase",
    "label": "Crunchbase",
    "category": "BUSINESS",
    "placeholder": "https://crunchbase.com/...",
    "color": "#0288D1",
    "iconName": "SiCrunchbase"
  },
  {
    "type": "wellfound",
    "label": "Wellfound",
    "category": "BUSINESS",
    "placeholder": "https://wellfound.com/...",
    "color": "#000000",
    "iconName": "Briefcase"
  },
  {
    "type": "shopify",
    "label": "Shopify",
    "category": "BUSINESS",
    "placeholder": "https://shopify.com/...",
    "color": "#95BF47",
    "iconName": "SiShopify"
  },
  {
    "type": "woocommerce",
    "label": "WooCommerce",
    "category": "BUSINESS",
    "placeholder": "https://woocommerce.com/...",
    "color": "#96588A",
    "iconName": "SiWoocommerce"
  },
  {
    "type": "etsy",
    "label": "Etsy",
    "category": "BUSINESS",
    "placeholder": "https://etsy.com/...",
    "color": "#F16521",
    "iconName": "SiEtsy"
  },
  {
    "type": "gumroad",
    "label": "Gumroad",
    "category": "BUSINESS",
    "placeholder": "https://gumroad.com/...",
    "color": "#000000",
    "iconName": "SiGumroad"
  },
  {
    "type": "lemonsqueezy",
    "label": "Lemon Squeezy",
    "category": "BUSINESS",
    "placeholder": "https://lemonsqueezy.com/...",
    "color": "#7047EB",
    "iconName": "ShoppingCart"
  },
  {
    "type": "sellfy",
    "label": "Sellfy",
    "category": "BUSINESS",
    "placeholder": "https://sellfy.com/...",
    "color": "#21B352",
    "iconName": "SiSellfy"
  },
  {
    "type": "amazonstore",
    "label": "Amazon Store",
    "category": "BUSINESS",
    "placeholder": "https://amazon.com/...",
    "color": "#FF9900",
    "iconName": "ShoppingCart"
  },
  {
    "type": "linkedin",
    "label": "LinkedIn",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://linkedin.com/in/",
    "color": "#0077B5",
    "iconName": "FaLinkedin"
  },
  {
    "type": "facebook",
    "label": "Facebook",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://facebook.com/",
    "color": "#1877F2",
    "iconName": "SiFacebook"
  },
  {
    "type": "instagram",
    "label": "Instagram",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://instagram.com/",
    "color": "#E4405F",
    "iconName": "SiInstagram"
  },
  {
    "type": "x",
    "label": "X.com",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://x.com/",
    "color": "#333333",
    "iconName": "SiX"
  },
  {
    "type": "youtube",
    "label": "YouTube",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://youtube.com/@",
    "color": "#FF0000",
    "iconName": "SiYoutube"
  },
  {
    "type": "tiktok",
    "label": "TikTok",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://tiktok.com/@",
    "color": "#333333",
    "iconName": "SiTiktok"
  },
  {
    "type": "snapchat",
    "label": "Snapchat",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://snapchat.com/add/",
    "color": "#E6E200",
    "iconName": "SiSnapchat"
  },
  {
    "type": "pinterest",
    "label": "Pinterest",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://pinterest.com/",
    "color": "#E60023",
    "iconName": "SiPinterest"
  },
  {
    "type": "threads",
    "label": "Threads",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://threads.net/@",
    "color": "#333333",
    "iconName": "SiThreads"
  },
  {
    "type": "reddit",
    "label": "Reddit",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://reddit.com/user/",
    "color": "#FF4500",
    "iconName": "SiReddit"
  },
  {
    "type": "discord",
    "label": "Discord",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://discord.com/users/",
    "color": "#5865F2",
    "iconName": "SiDiscord"
  },
  {
    "type": "twitch",
    "label": "Twitch",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://twitch.tv/",
    "color": "#9146FF",
    "iconName": "SiTwitch"
  },
  {
    "type": "github",
    "label": "GitHub",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://github.com/",
    "color": "#333333",
    "iconName": "SiGithub"
  },
  {
    "type": "behance",
    "label": "Behance",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://behance.net/",
    "color": "#1769FF",
    "iconName": "SiBehance"
  },
  {
    "type": "dribbble",
    "label": "Dribbble",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://dribbble.com/",
    "color": "#EA4C89",
    "iconName": "SiDribbble"
  },
  {
    "type": "medium",
    "label": "Medium",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://medium.com/@",
    "color": "#333333",
    "iconName": "SiMedium"
  },
  {
    "type": "vimeo",
    "label": "Vimeo",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://vimeo.com/",
    "color": "#1AB7EA",
    "iconName": "SiVimeo"
  },
  {
    "type": "gitlab",
    "label": "GitLab",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://gitlab.com/",
    "color": "#FC6D26",
    "iconName": "SiGitlab"
  },
  {
    "type": "bitbucket",
    "label": "Bitbucket",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://bitbucket.org/",
    "color": "#0052CC",
    "iconName": "SiBitbucket"
  },
  {
    "type": "codepen",
    "label": "CodePen",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://codepen.io/...",
    "color": "#000000",
    "iconName": "Code"
  },
  {
    "type": "stackoverflow",
    "label": "Stack Overflow",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://stackoverflow.com/users/...",
    "color": "#F58025",
    "iconName": "SiStackoverflow"
  },
  {
    "type": "devto",
    "label": "Dev.to",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://dev.to/",
    "color": "#0A0A0A",
    "iconName": "SiDevdotto"
  },
  {
    "type": "hashnode",
    "label": "Hashnode",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://hashnode.com/@",
    "color": "#2962FF",
    "iconName": "SiHashnode"
  },
  {
    "type": "npm",
    "label": "NPM",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://npmjs.com/...",
    "color": "#CB3837",
    "iconName": "SiNpm"
  },
  {
    "type": "huggingface",
    "label": "Hugging Face",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://huggingface.co/...",
    "color": "#FFD21E",
    "iconName": "SiHuggingface"
  },
  {
    "type": "dockerhub",
    "label": "Docker Hub",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://hub.docker.com/u/",
    "color": "#2496ED",
    "iconName": "SiDocker"
  },
  {
    "type": "replit",
    "label": "Replit",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://replit.com/@",
    "color": "#F26207",
    "iconName": "SiReplit"
  },
  {
    "type": "substack",
    "label": "Substack",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://substack.com/...",
    "color": "#FF6719",
    "iconName": "SiSubstack"
  },
  {
    "type": "ghost",
    "label": "Ghost",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://ghost.org/...",
    "color": "#15171A",
    "iconName": "SiGhost"
  },
  {
    "type": "flickr",
    "label": "Flickr",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://flickr.com/photos/",
    "color": "#0063DC",
    "iconName": "SiFlickr"
  },
  {
    "type": "500px",
    "label": "500px",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://500px.com/p/",
    "color": "#0099E5",
    "iconName": "Camera"
  },
  {
    "type": "artstation",
    "label": "ArtStation",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://artstation.com/",
    "color": "#13AFF0",
    "iconName": "SiArtstation"
  },
  {
    "type": "pixiv",
    "label": "Pixiv",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://pixiv.net/users/",
    "color": "#0096FA",
    "iconName": "SiPixiv"
  },
  {
    "type": "bluesky",
    "label": "Bluesky",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://bsky.app/profile/",
    "color": "#0085FF",
    "iconName": "SiBluesky"
  },
  {
    "type": "mastodon",
    "label": "Mastodon",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://mastodon.social/@",
    "color": "#6364FF",
    "iconName": "SiMastodon"
  },
  {
    "type": "fiverr",
    "label": "Fiverr",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://fiverr.com/",
    "color": "#1DBF73",
    "iconName": "SiFiverr"
  },
  {
    "type": "upwork",
    "label": "Upwork",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://upwork.com/freelancers/~",
    "color": "#14A800",
    "iconName": "SiUpwork"
  },
  {
    "type": "contra",
    "label": "Contra",
    "category": "SOCIAL_MEDIA",
    "placeholder": "https://contra.com/...",
    "color": "#000000",
    "iconName": "Briefcase"
  },
  {
    "type": "freelancer",
    "label": "Freelancer",
    "category": "SOCIAL_MEDIA",
    "placeholder": "username",
    "prefix": "https://freelancer.com/u/",
    "color": "#29B2FE",
    "iconName": "SiFreelancer"
  },
  {
    "type": "paypal",
    "label": "PayPal",
    "category": "PAYMENT",
    "placeholder": "username",
    "prefix": "https://paypal.me/",
    "color": "#00457C",
    "iconName": "SiPaypal"
  },
  {
    "type": "cashapp",
    "label": "Cash App",
    "category": "PAYMENT",
    "placeholder": "username",
    "prefix": "https://cash.app/$",
    "color": "#00D632",
    "iconName": "SiCashapp"
  },
  {
    "type": "venmo",
    "label": "Venmo",
    "category": "PAYMENT",
    "placeholder": "username",
    "prefix": "https://venmo.com/u/",
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
    "placeholder": "username",
    "prefix": "https://patreon.com/",
    "color": "#FF424D",
    "iconName": "SiPatreon"
  },
  {
    "type": "buymeacoffee",
    "label": "Buy Me a Coffee",
    "category": "PAYMENT",
    "placeholder": "username",
    "prefix": "https://buymeacoffee.com/",
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
    "type": "bkash",
    "label": "bKash",
    "category": "PAYMENT",
    "placeholder": "bKash number or link",
    "color": "#E2136E",
    "iconName": "Wallet"
  },
  {
    "type": "nagad",
    "label": "Nagad",
    "category": "PAYMENT",
    "placeholder": "Nagad number",
    "color": "#ED1C24",
    "iconName": "Wallet"
  },
  {
    "type": "rocket",
    "label": "Rocket",
    "category": "PAYMENT",
    "placeholder": "Rocket number",
    "color": "#8C1515",
    "iconName": "Wallet"
  },
  {
    "type": "upay",
    "label": "Upay",
    "category": "PAYMENT",
    "placeholder": "Upay number",
    "color": "#FFCC00",
    "iconName": "Wallet"
  },
  {
    "type": "bankaccount",
    "label": "Bank Account",
    "category": "PAYMENT",
    "placeholder": "Bank Name, A/C No",
    "color": "#000000",
    "iconName": "Building"
  },
  {
    "type": "revolut",
    "label": "Revolut",
    "category": "PAYMENT",
    "placeholder": "https://revolut.me/...",
    "color": "#000000",
    "iconName": "SiRevolut"
  },
  {
    "type": "skrill",
    "label": "Skrill",
    "category": "PAYMENT",
    "placeholder": "Skrill email",
    "color": "#820036",
    "iconName": "Wallet"
  },
  {
    "type": "binancepay",
    "label": "Binance Pay",
    "category": "PAYMENT",
    "placeholder": "Pay ID",
    "color": "#FCD535",
    "iconName": "SiBinance"
  },
  {
    "type": "coinbase",
    "label": "Coinbase",
    "category": "PAYMENT",
    "placeholder": "https://coinbase.com/...",
    "color": "#0052FF",
    "iconName": "SiCoinbase"
  },
  {
    "type": "kofi",
    "label": "Ko-fi",
    "category": "PAYMENT",
    "placeholder": "https://ko-fi.com/...",
    "color": "#FF5E5B",
    "iconName": "SiKofi"
  },
  {
    "type": "githubsponsors",
    "label": "GitHub Sponsors",
    "category": "PAYMENT",
    "placeholder": "username",
    "prefix": "https://github.com/sponsors/",
    "color": "#EA4AAA",
    "iconName": "SiGithubsponsors"
  },
  {
    "type": "opencollective",
    "label": "Open Collective",
    "category": "PAYMENT",
    "placeholder": "https://opencollective.com/...",
    "color": "#7FADF2",
    "iconName": "SiOpencollective"
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
    "type": "tidal",
    "label": "Tidal",
    "category": "MUSIC",
    "placeholder": "https://tidal.com/...",
    "color": "#000000",
    "iconName": "SiTidal"
  },
  {
    "type": "amazonmusic",
    "label": "Amazon Music",
    "category": "MUSIC",
    "placeholder": "https://music.amazon.com/...",
    "color": "#00A8E1",
    "iconName": "ShoppingCart"
  },
  {
    "type": "applepodcasts",
    "label": "Apple Podcasts",
    "category": "MUSIC",
    "placeholder": "https://podcasts.apple.com/...",
    "color": "#B150E2",
    "iconName": "SiApplepodcasts"
  },
  {
    "type": "spotifypodcast",
    "label": "Spotify Podcast",
    "category": "MUSIC",
    "placeholder": "https://open.spotify.com/show/...",
    "color": "#1DB954",
    "iconName": "SiSpotify"
  },
  {
    "type": "linktree",
    "label": "Linktree",
    "category": "OTHER",
    "placeholder": "https://linktr.ee/...",
    "color": "#43E660",
    "iconName": "SiLinktree"
  },
  {
    "type": "linkinbio",
    "label": "Link in Bio",
    "category": "OTHER",
    "placeholder": "https://...",
    "color": "#000000",
    "iconName": "Link2"
  },
  {
    "type": "qrcode",
    "label": "QR Code",
    "category": "OTHER",
    "placeholder": "Upload or enter link",
    "color": "#000000",
    "iconName": "QrCode"
  },
  {
    "type": "vcard",
    "label": "vCard Download",
    "category": "OTHER",
    "placeholder": "Select contact details",
    "color": "#10B981",
    "iconName": "Contact"
  },
  {
    "type": "pdf",
    "label": "PDF Document",
    "category": "OTHER",
    "placeholder": "Upload or enter link",
    "color": "#E2574C",
    "iconName": "FileText"
  },
  {
    "type": "appstore",
    "label": "App Store",
    "category": "OTHER",
    "placeholder": "https://apps.apple.com/...",
    "color": "#0070C9",
    "iconName": "SiAppstore"
  },
  {
    "type": "googleplay",
    "label": "Google Play",
    "category": "OTHER",
    "placeholder": "https://play.google.com/...",
    "color": "#414141",
    "iconName": "SiGoogleplay"
  },
  {
    "type": "wetransfer",
    "label": "WeTransfer",
    "category": "OTHER",
    "placeholder": "https://we.tl/...",
    "color": "#409FFF",
    "iconName": "SiWetransfer"
  },
  {
    "type": "mega",
    "label": "MEGA",
    "category": "OTHER",
    "placeholder": "https://mega.nz/...",
    "color": "#D9272E",
    "iconName": "SiMega"
  },
  {
    "type": "box",
    "label": "Box",
    "category": "OTHER",
    "placeholder": "https://box.com/...",
    "color": "#0061D5",
    "iconName": "SiBox"
  },
  {
    "type": "icloud",
    "label": "iCloud Drive",
    "category": "OTHER",
    "placeholder": "https://icloud.com/...",
    "color": "#3693F3",
    "iconName": "SiIcloud"
  },
  {
    "type": "chatgpt",
    "label": "ChatGPT Share",
    "category": "OTHER",
    "placeholder": "https://chatgpt.com/share/...",
    "color": "#10A37F",
    "iconName": "MessageSquare"
  },
  {
    "type": "claude",
    "label": "Claude",
    "category": "OTHER",
    "placeholder": "https://claude.ai/...",
    "color": "#D97757",
    "iconName": "SiAnthropic"
  },
  {
    "type": "gemini",
    "label": "Gemini",
    "category": "OTHER",
    "placeholder": "https://gemini.google.com/...",
    "color": "#8E75B2",
    "iconName": "SiGoogle"
  },
  {
    "type": "perplexity",
    "label": "Perplexity",
    "category": "OTHER",
    "placeholder": "https://perplexity.ai/...",
    "color": "#22B8CD",
    "iconName": "SiPerplexity"
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
