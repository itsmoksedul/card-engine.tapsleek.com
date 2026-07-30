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
export declare const LINK_CATALOG: LinkTypeDef[];
export declare const LINK_CATEGORIES: {
    id: LinkCategory | "ALL";
    label: string;
}[];
export declare function linkDef(type: string): LinkTypeDef | undefined;
export declare function linkLabel(type: string): string;
export declare function isProOnlyLinkType(type: string): boolean;
