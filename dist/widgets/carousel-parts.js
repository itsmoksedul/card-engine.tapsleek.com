"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carouselDefaultPartStyles = exports.carouselParts = void 0;
exports.carouselParts = [
    {
        key: "carouselRoot",
        label: "Carousel Container",
        kind: "container",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselTrack",
        label: "Carousel Track",
        kind: "container",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselArrowPrev",
        label: "Prev Arrow",
        kind: "button",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselArrowNext",
        label: "Next Arrow",
        kind: "button",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselArrowIcon",
        label: "Arrow Icon",
        kind: "icon",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselDots",
        label: "Dots Container",
        kind: "container",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselDot",
        label: "Dot (Inactive)",
        kind: "button",
        visibleIf: { key: "useCarousel", equals: true },
    },
    {
        key: "carouselDotActive",
        label: "Dot (Active)",
        kind: "button",
        visibleIf: { key: "useCarousel", equals: true },
    },
];
exports.carouselDefaultPartStyles = {
    carouselRoot: {
        base: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "{space.4}",
        },
    },
    carouselTrack: {
        base: {
            display: "flex",
            overflowX: "auto",
            gap: "{space.3}",
            padding: { b: "{space.2}" },
            /* Hide scrollbar by default in native CSS */
        },
    },
    carouselArrowPrev: {
        base: {
            display: "none", // Admin can toggle display to flex if they want arrows
            position: "absolute",
            left: "{space.2}",
            top: "50%",
            transform: { translateY: "-50%" },
            zIndex: 10,
            width: "32px",
            height: "32px",
            alignItems: "center",
            justifyContent: "center",
            background: { kind: "color", color: "{color.surface}" },
            borderRadius: { all: "50%" },
            border: { style: "solid", width: "1px", color: "{color.border}" },
            boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" },
            cursor: "pointer",
        },
    },
    carouselArrowNext: {
        base: {
            display: "none",
            position: "absolute",
            right: "{space.2}",
            top: "50%",
            transform: { translateY: "-50%" },
            zIndex: 10,
            width: "32px",
            height: "32px",
            alignItems: "center",
            justifyContent: "center",
            background: { kind: "color", color: "{color.surface}" },
            borderRadius: { all: "50%" },
            border: { style: "solid", width: "1px", color: "{color.border}" },
            boxShadow: { x: "0", y: "2px", blur: "4px", color: "rgba(0,0,0,0.1)" },
            cursor: "pointer",
        },
    },
    carouselArrowIcon: {
        base: {
            width: "16px",
            height: "16px",
            color: "{color.text}",
        },
    },
    carouselDots: {
        base: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "{space.2}",
            margin: { t: "{space.2}" },
        },
    },
    carouselDot: {
        base: {
            width: "8px",
            height: "8px",
            borderRadius: { all: "50%" },
            background: { kind: "color", color: "{color.border}" },
            cursor: "pointer",
            padding: { all: "0" },
            border: { style: "none", width: "0" },
        },
    },
    carouselDotActive: {
        base: {
            width: "8px",
            height: "8px",
            borderRadius: { all: "50%" },
            background: { kind: "color", color: "{color.primary}" },
            cursor: "pointer",
            padding: { all: "0" },
            border: { style: "none", width: "0" },
        },
    },
};
