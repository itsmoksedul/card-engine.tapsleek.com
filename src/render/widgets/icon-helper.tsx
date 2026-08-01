import * as LucideIcons from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { linkDef } from "../../catalog/links";
import {
  SiAnthropic,
  SiApplemusic,
  SiApplepodcasts,
  SiAppstore,
  SiArtstation,
  SiAudiomack,
  SiBandcamp,
  SiBehance,
  SiBinance,
  SiBitbucket,
  SiBluesky,
  SiBox,
  SiBuymeacoffee,
  SiCalendly,
  SiCashapp,
  SiCoinbase,
  SiCrunchbase,
  SiDeezer,
  SiDevdotto,
  SiDiscord,
  SiDocker,
  SiDribbble,
  SiDropbox,
  SiEtsy,
  SiFacebook,
  SiFigma,
  SiFiverr,
  SiFlickr,
  SiFramer,
  SiFreelancer,
  SiG2,
  SiGhost,
  SiGithub,
  SiGithubsponsors,
  SiGitlab,
  SiGofundme,
  SiGoogle,
  SiGooglechat,
  SiGoogledocs,
  SiGoogledrive,
  SiGooglemaps,
  SiGooglemeet,
  SiGoogleplay,
  SiGooglesheets,
  SiGoogleslides,
  SiGumroad,
  SiHashnode,
  SiHuggingface,
  SiIcloud,
  SiInstagram,
  SiKakaotalk,
  SiKofi,
  SiLine,
  SiLinktree,
  SiMastodon,
  SiMedium,
  SiMega,
  SiMessenger,
  SiNpm,
  SiOpencollective,
  SiPatreon,
  SiPayoneer,
  SiPaypal,
  SiPerplexity,
  SiPinterest,
  SiPixiv,
  SiProducthunt,
  SiReddit,
  SiReplit,
  SiRevolut,
  SiSellfy,
  SiShopify,
  SiSignal,
  SiSnapchat,
  SiSoundcloud,
  SiSpotify,
  SiStackoverflow,
  SiStripe,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTidal,
  SiTiktok,
  SiTripadvisor,
  SiTrustpilot,
  SiTwitch,
  SiUpwork,
  SiVenmo,
  SiViber,
  SiVimeo,
  SiWechat,
  SiWetransfer,
  SiWhatsapp,
  SiWise,
  SiWoocommerce,
  SiX,
  SiYelp,
  SiYoutube,
  SiYoutubemusic,
  SiZoom
} from "react-icons/si";

const SI_MAP: Record<string, any> = {
  SiAnthropic, SiApplemusic, SiApplepodcasts, SiAppstore, SiArtstation, SiAudiomack, SiBandcamp, SiBehance, SiBinance, SiBitbucket, SiBluesky, SiBox, SiBuymeacoffee, SiCalendly, SiCashapp, SiCoinbase, SiCrunchbase, SiDeezer, SiDevdotto, SiDiscord, SiDocker, SiDribbble, SiDropbox, SiEtsy, SiFacebook, SiFigma, SiFiverr, SiFlickr, SiFramer, SiFreelancer, SiG2, SiGhost, SiGithub, SiGithubsponsors, SiGitlab, SiGofundme, SiGoogle, SiGooglechat, SiGoogledocs, SiGoogledrive, SiGooglemaps, SiGooglemeet, SiGoogleplay, SiGooglesheets, SiGoogleslides, SiGumroad, SiHashnode, SiHuggingface, SiIcloud, SiInstagram, SiKakaotalk, SiKofi, SiLine, SiLinktree, SiMastodon, SiMedium, SiMega, SiMessenger, SiNpm, SiOpencollective, SiPatreon, SiPayoneer, SiPaypal, SiPerplexity, SiPinterest, SiPixiv, SiProducthunt, SiReddit, SiReplit, SiRevolut, SiSellfy, SiShopify, SiSignal, SiSnapchat, SiSoundcloud, SiSpotify, SiStackoverflow, SiStripe, SiSubstack, SiTelegram, SiThreads, SiTidal, SiTiktok, SiTripadvisor, SiTrustpilot, SiTwitch, SiUpwork, SiVenmo, SiViber, SiVimeo, SiWechat, SiWetransfer, SiWhatsapp, SiWise, SiWoocommerce, SiX, SiYelp, SiYoutube, SiYoutubemusic, SiZoom
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
