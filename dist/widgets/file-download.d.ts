/**
 * FILE_DOWNLOAD — a downloadable file (company profile, brochure, price list…)
 * shown as a card: title, file type + size, and a download button.
 *
 * `file` is a link or a file picked from the media library. Editors fill
 * `fileType` / `fileSize` automatically when the file comes from the library;
 * for a pasted link the user picks the type and types the size.
 */
import type { WidgetModule } from "../types/widget";
export declare const FILE_TYPES: string[];
export declare const meta: WidgetModule["meta"];
export declare const previews: {
    empty: {
        title: string;
        icon: string;
        file: string;
        fileType: string;
        fileSize: string;
    };
    typical: Record<string, unknown>;
    stress: {
        title: string;
        icon: string;
        file: string;
        fileType: string;
        fileSize: string;
    };
};
