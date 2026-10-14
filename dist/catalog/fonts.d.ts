/**
 * Google Fonts Catalog
 * Full list of Google Fonts for TapSleek Card Engine, Admin Builder & User Editor.
 */
export declare const POPULAR_GOOGLE_FONTS: readonly ["Inter", "Roboto", "Poppins", "Open Sans", "Montserrat", "Lato", "Plus Jakarta Sans", "Outfit", "Oswald", "Raleway", "Nunito", "Nunito Sans", "Playfair Display", "Rubik", "Lora", "Manrope", "DM Sans", "Space Grotesk", "Work Sans", "Fira Sans", "Quicksand", "Syne", "Barlow", "Merriweather", "PT Sans", "PT Serif", "Cinzel", "Bebas Neue", "Anton", "Bitter", "Pacifico", "Caveat", "Lobster", "Dancing Script", "Great Vibes", "Source Code Pro", "Inconsolata", "Roboto Mono", "JetBrains Mono", "Ubuntu"];
export declare const SYSTEM_FONTS: Set<string>;
export declare const GOOGLE_FONTS: readonly string[];
export declare function isGoogleFont(family: string): boolean;
export declare function isSystemFont(family: string): boolean;
export declare function getGoogleFontUrl(families: string | string[], weights?: number[]): string | null;
