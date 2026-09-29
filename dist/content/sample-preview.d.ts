import type { TemplateDefinition } from "../types/definition";
export declare const DEMO_PREVIEW_ASSETS: {
    avatar: string;
    cover: string;
    logo: string;
};
export declare function generatePreviewCard(definition?: TemplateDefinition | null, profile?: "typical" | "empty" | "stress"): Record<string, unknown>;
export declare function generatePreviewContent(definition?: TemplateDefinition | null, profile?: "typical" | "empty" | "stress"): Record<string, unknown>;
export declare function generatePreviewLinks(definition?: TemplateDefinition | null, profile?: "typical" | "empty" | "stress"): Array<Record<string, unknown>>;
