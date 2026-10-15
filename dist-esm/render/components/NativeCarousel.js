"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
export function NativeCarousel({ cls, items, layout }) {
    const trackRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const onScroll = useCallback(() => {
        if (!trackRef.current)
            return;
        const { scrollLeft, clientWidth } = trackRef.current;
        // Calculate which item is most visible
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    }, [activeIndex]);
    const scrollTo = (index) => {
        if (!trackRef.current)
            return;
        const item = trackRef.current.children[index];
        if (item) {
            trackRef.current.scrollTo({
                left: item.offsetLeft - trackRef.current.offsetLeft,
                behavior: 'smooth',
            });
            setActiveIndex(index);
        }
    };
    const next = () => scrollTo(Math.min(activeIndex + 1, items.length - 1));
    const prev = () => scrollTo(Math.max(activeIndex - 1, 0));
    useEffect(() => {
        const track = trackRef.current;
        if (!track)
            return;
        track.addEventListener('scroll', onScroll, { passive: true });
        return () => track.removeEventListener('scroll', onScroll);
    }, [onScroll]);
    return (_jsxs("div", { className: cls('carouselRoot'), "data-layout": layout, children: [items.length > 1 && (_jsx("button", { type: "button", className: cls('carouselArrowPrev'), onClick: prev, disabled: activeIndex === 0, "aria-label": "Previous", children: _jsx("span", { className: cls('carouselArrowIcon'), "data-dir": "left" }) })), _jsx("div", { className: cls('carouselTrack'), ref: trackRef, style: { scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }, children: items.map((item, i) => (_jsx("div", { style: { scrollSnapAlign: 'start', flex: '0 0 100%', minWidth: 0 }, children: item }, i))) }), items.length > 1 && (_jsx("button", { type: "button", className: cls('carouselArrowNext'), onClick: next, disabled: activeIndex === items.length - 1, "aria-label": "Next", children: _jsx("span", { className: cls('carouselArrowIcon'), "data-dir": "right" }) })), items.length > 1 && (_jsx("div", { className: cls('carouselDots'), "aria-label": "Carousel pagination", children: items.map((_, i) => (_jsx("button", { type: "button", className: i === activeIndex ? cls('carouselDotActive') : cls('carouselDot'), onClick: () => scrollTo(i), "aria-label": `Go to slide ${i + 1}`, "aria-pressed": i === activeIndex }, i))) }))] }));
}
