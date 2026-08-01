"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeCarousel = NativeCarousel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function NativeCarousel({ cls, items, layout }) {
    const trackRef = (0, react_1.useRef)(null);
    const [activeIndex, setActiveIndex] = (0, react_1.useState)(0);
    const onScroll = (0, react_1.useCallback)(() => {
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
    (0, react_1.useEffect)(() => {
        const track = trackRef.current;
        if (!track)
            return;
        track.addEventListener('scroll', onScroll, { passive: true });
        return () => track.removeEventListener('scroll', onScroll);
    }, [onScroll]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('carouselRoot'), "data-layout": layout, children: [items.length > 1 && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: cls('carouselArrowPrev'), onClick: prev, disabled: activeIndex === 0, "aria-label": "Previous", children: (0, jsx_runtime_1.jsx)("span", { className: cls('carouselArrowIcon'), "data-dir": "left" }) })), (0, jsx_runtime_1.jsx)("div", { className: cls('carouselTrack'), ref: trackRef, style: { scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }, children: items.map((item, i) => ((0, jsx_runtime_1.jsx)("div", { style: { scrollSnapAlign: 'start', flex: '0 0 100%', minWidth: 0 }, children: item }, i))) }), items.length > 1 && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: cls('carouselArrowNext'), onClick: next, disabled: activeIndex === items.length - 1, "aria-label": "Next", children: (0, jsx_runtime_1.jsx)("span", { className: cls('carouselArrowIcon'), "data-dir": "right" }) })), items.length > 1 && ((0, jsx_runtime_1.jsx)("div", { className: cls('carouselDots'), "aria-label": "Carousel pagination", children: items.map((_, i) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: i === activeIndex ? cls('carouselDotActive') : cls('carouselDot'), onClick: () => scrollTo(i), "aria-label": `Go to slide ${i + 1}`, "aria-pressed": i === activeIndex }, i))) }))] }));
}
