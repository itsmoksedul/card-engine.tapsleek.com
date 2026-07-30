import * as LucideIcons from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { linkDef } from "../../catalog/links";
import {
  SiWhatsapp,
  SiMessenger,
  SiSignal,
  SiViber,
  SiWechat,
  SiGooglemaps,
  
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiTiktok,
  SiTelegram,
  SiSnapchat,
  SiPinterest,
  SiThreads,
  SiReddit,
  SiDiscord,
  SiTwitch,
  SiGithub,
  SiBehance,
  SiDribbble,
  SiMedium,
  SiVimeo,
  SiPaypal,
  SiCashapp,
  SiVenmo,
  SiStripe,
  SiPayoneer,
  SiWise,
  SiPatreon,
  SiBuymeacoffee,
  SiGofundme,
  SiSpotify,
  SiApplemusic,
  SiSoundcloud,
  SiYoutubemusic,
  SiDeezer,
  SiBandcamp,
  SiAudiomack,
  SiLinktree
} from "react-icons/si";

const SI_MAP: Record<string, any> = {
  SiWhatsapp, SiMessenger, SiSignal, SiViber, SiWechat, SiGooglemaps,  SiFacebook, SiInstagram, SiX, SiYoutube, SiTiktok, SiTelegram, SiSnapchat, SiPinterest, SiThreads, SiReddit, SiDiscord, SiTwitch, SiGithub, SiBehance, SiDribbble, SiMedium, SiVimeo, SiPaypal, SiCashapp, SiVenmo, SiStripe, SiPayoneer, SiWise, SiPatreon, SiBuymeacoffee, SiGofundme, SiSpotify, SiApplemusic, SiSoundcloud, SiYoutubemusic, SiDeezer, SiBandcamp, SiAudiomack, SiLinktree
};

const COMMON_ICON_MAP: Record<string, string> = {
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

export function RenderIcon({
  name,
  className,
}: {
  name?: string | Record<string, any> | null;
  className?: string;
}) {
  if (!name) return null;

  let iconValue = name;

  if (typeof name === "string") {
    const def = linkDef(name);
    if (def && def.iconSvg) {
      return (
        <span
          className={className}
          data-icon={def.type}
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          dangerouslySetInnerHTML={{ __html: def.iconSvg }}
        />
      );
    }
    
    if (def && def.iconName) {
      iconValue = def.iconName;
    }
  }

  if (typeof iconValue === "object" && iconValue !== null) {
    if (iconValue.type === "svg" && iconValue.svg) {
      return (
        <span
          className={className}
          data-icon={iconValue.name ?? "custom"}
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          dangerouslySetInnerHTML={{ __html: iconValue.svg }}
        />
      );
    }
    if (iconValue.type === "url" && iconValue.url) {
      return (
        <span
          className={className}
          data-icon={iconValue.name ?? "custom-url"}
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={iconValue.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </span>
      );
    }
    if (iconValue.type === "react-icon" && iconValue.name) {
      iconValue = iconValue.name;
    } else {
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
  
  if (formatted === "FaLinkedin") { IconComponent = FaLinkedin; } else if (formatted.startsWith("Si") && SI_MAP[formatted]) {
    IconComponent = SI_MAP[formatted];
  } else {
    IconComponent =
      (LucideIcons as any)[formatted] ??
      (LucideIcons as any)[mapped] ??
      (LucideIcons as any)[upper] ??
      LucideIcons.Globe;
  }

  return (
    <span
      className={className}
      data-icon={String(iconValue)}
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconComponent style={{ width: "1em", height: "1em", flexShrink: 0 }} />
    </span>
  );
}
