import * as LucideIcons from "lucide-react";

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

  if (typeof iconValue === "object" && iconValue !== null) {
    if (iconValue.type === "svg" && iconValue.svg) {
      return (
        <span
          className={className}
          data-icon={iconValue.name || "custom"}
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
          data-icon={iconValue.name || "url"}
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

  const IconComponent =
    (LucideIcons as any)[formatted] ??
    (LucideIcons as any)[mapped] ??
    (LucideIcons as any)[upper] ??
    LucideIcons.Globe;

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
