import React from 'react';
export interface NativeCarouselProps {
    cls: (part: string) => string;
    items: React.ReactNode[];
    /** Passed down to the track to layout items if needed */
    layout?: string;
}
export declare function NativeCarousel({ cls, items, layout }: NativeCarouselProps): React.JSX.Element;
