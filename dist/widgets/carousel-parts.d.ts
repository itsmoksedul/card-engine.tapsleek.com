import type { WidgetModule, WidgetPart } from "../types/widget";
export declare const carouselParts: WidgetPart[];
export declare function getCarouselDesignSchema(dotsKey?: string): any[];
export declare const carouselDefaultPartStyles: WidgetModule["meta"]["defaultPartStyles"];
export declare function createCarouselLayout(itemNode: any, options?: {
    itemsPath?: string;
    dotsKey?: string;
}): any;
