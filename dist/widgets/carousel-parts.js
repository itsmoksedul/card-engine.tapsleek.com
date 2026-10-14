"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carouselDefaultPartStyles = exports.CAROUSEL_PART_COUNTERPARTS = exports.carouselParts = void 0;
exports.getCarouselDesignSchema = getCarouselDesignSchema;
exports.createCarouselLayout = createCarouselLayout;
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
exports.CAROUSEL_PART_COUNTERPARTS = {
    // Container / Card
    item: ["c_item", "carouselItem"],
    c_item: ["item", "carouselItem"],
    carouselItem: ["item", "c_item"],
    // Index
    itemIndex: ["c_itemIndex"],
    c_itemIndex: ["itemIndex"],
    // Title / Heading / Name
    itemTitle: ["c_itemTitle", "c_title", "title", "title_1"],
    c_itemTitle: ["itemTitle", "title", "c_title"],
    title: ["c_title", "itemTitle", "c_itemTitle", "title_1"],
    c_title: ["title", "itemTitle", "c_itemTitle"],
    title_1: ["title", "itemTitle"],
    name: ["name_1", "c_name"],
    name_1: ["name", "c_name"],
    c_name: ["name", "name_1"],
    // Description / Caption / Bio
    itemDesc: ["c_itemDesc", "description", "c_description", "caption", "caption_1"],
    c_itemDesc: ["itemDesc", "description", "c_description", "caption", "caption_1"],
    description: ["c_description", "itemDesc", "c_itemDesc"],
    c_description: ["description", "itemDesc", "c_itemDesc"],
    caption: ["caption_1", "c_caption", "c_itemDesc", "itemDesc"],
    caption_1: ["caption", "c_caption", "c_itemDesc", "itemDesc"],
    c_caption: ["caption", "caption_1", "itemDesc", "c_itemDesc"],
    bio: ["bio_1", "c_bio"],
    bio_1: ["bio", "c_bio"],
    c_bio: ["bio", "bio_1"],
    // Media / Image / Thumbnail / Photo
    itemMedia: ["c_media", "image", "image_1", "thumbnail", "c_thumbnail"],
    c_media: ["itemMedia", "image", "image_1", "thumbnail", "c_thumbnail"],
    image: ["image_1", "c_media", "itemMedia", "thumbnail", "c_thumbnail"],
    image_1: ["image", "c_media", "itemMedia"],
    thumbnail: ["c_thumbnail", "image", "itemMedia"],
    c_thumbnail: ["thumbnail", "image", "itemMedia"],
    // Price
    itemPrice: ["c_itemPrice", "price", "c_price"],
    c_itemPrice: ["itemPrice", "price", "c_price"],
    price: ["c_price", "itemPrice", "c_itemPrice"],
    c_price: ["price", "itemPrice", "c_itemPrice"],
    // Link
    itemLink: ["c_itemLink"],
    c_itemLink: ["itemLink"],
    // Quote
    quote: ["c_quote"],
    c_quote: ["quote"],
    // Avatar
    avatar: ["c_avatar", "image"],
    c_avatar: ["avatar", "image"],
    // Author
    author: ["c_author"],
    c_author: ["author"],
    // Role
    role: ["role_1", "c_role"],
    role_1: ["role", "c_role"],
    c_role: ["role", "role_1"],
    // Video
    video: ["c_video"],
    c_video: ["video"],
    // Layout Sub-containers
    content: ["info", "c_content"],
    info: ["content", "c_content"],
    c_content: ["content", "info"],
    titleRow: ["c_titleRow"],
    c_titleRow: ["titleRow"],
    dots: ["c_line"],
    c_line: ["dots"],
};
function getCarouselDesignSchema(dotsKey = "showDots") {
    return [
        {
            key: "showArrows",
            type: "boolean",
            label: "Show Arrows",
            visibleIf: { key: "useCarousel", equals: true },
        },
        {
            key: dotsKey,
            type: "boolean",
            label: "Show Pagination",
            visibleIf: { key: "useCarousel", equals: true },
        },
        {
            key: "carouselSlidesPerView",
            type: "select",
            label: "Slides Per View",
            visibleIf: { key: "useCarousel", equals: true },
            options: [
                { value: "1", label: "1 (Full)" },
                { value: "1.2", label: "1.2 (Peek)" },
                { value: "1.25", label: "1.25 (with peek)" },
                { value: "1.5", label: "1.5 (Peek)" },
                { value: "2", label: "2 (Full)" },
                { value: "2.2", label: "2.2 (Peek)" },
                { value: "2.25", label: "2.25 (with peek)" },
                { value: "2.5", label: "2.5 (Peek)" },
                { value: "3", label: "3 (Full)" },
            ],
        },
        {
            key: "carouselAlign",
            type: "select",
            label: "Alignment",
            visibleIf: { key: "useCarousel", equals: true },
            options: [
                { value: "start", label: "Start" },
                { value: "center", label: "Center" },
                { value: "end", label: "End" },
            ],
        },
        {
            key: "carouselLoop",
            type: "boolean",
            label: "Infinite Loop",
            visibleIf: { key: "useCarousel", equals: true },
        },
        {
            key: "carouselAutoplay",
            type: "boolean",
            label: "Autoplay",
            visibleIf: { key: "useCarousel", equals: true },
        },
        {
            key: "carouselAutoplayDelay",
            type: "select",
            label: "Autoplay Speed",
            visibleIf: { key: "carouselAutoplay", equals: true },
            options: [
                { value: "2000", label: "2 Seconds" },
                { value: "3000", label: "3 Seconds" },
                { value: "5000", label: "5 Seconds" },
                { value: "7000", label: "7 Seconds" },
            ],
        },
    ];
}
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
            overflow: "visible",
            padding: { b: "{space.2}" },
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
        },
    },
};
function createCarouselLayout(itemNode, options) {
    const itemsPath = options?.itemsPath ?? "items";
    const dotsKey = options?.dotsKey ?? "showDots";
    return {
        id: "carouselRoot",
        kind: "element",
        tag: "carousel-root",
        name: "Carousel Container",
        visibleIf: { key: "useCarousel", equals: true },
        style: {
            base: {
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "{space.4}",
            },
        },
        children: [
            {
                id: "carouselTrack",
                kind: "element",
                tag: "carousel",
                name: "Carousel Track",
                style: {
                    base: {
                        display: "flex",
                        overflow: "visible",
                        padding: { b: "{space.2}" },
                    },
                },
                children: [
                    {
                        ...itemNode,
                        id: itemNode.id || "carouselItem",
                        repeat: { source: "self", path: itemsPath },
                        style: {
                            ...itemNode.style,
                            base: {
                                ...(itemNode.style?.base || {}),
                                flexGrow: 0,
                                flexShrink: 0,
                                minWidth: 0,
                            },
                        },
                    },
                ],
            },
            {
                id: "carouselControls",
                kind: "element",
                tag: "frame",
                name: "Controls",
                style: {
                    base: {
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: { t: "{space.4}" },
                    },
                },
                children: [
                    {
                        id: "carouselArrows",
                        kind: "element",
                        tag: "stack",
                        name: "Arrows",
                        visibleIf: { key: "showArrows", equals: true },
                        style: {
                            base: { display: "flex", flexDirection: "row", gap: "{space.2}" },
                        },
                        children: [
                            {
                                id: "arrowPrev",
                                kind: "element",
                                tag: "button",
                                name: "Prev Arrow",
                                props: { action: "carousel-prev" },
                                style: {
                                    base: {
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: { kind: "color", color: "{color.surface}" },
                                        borderRadius: { all: "50%" },
                                        border: {
                                            style: "solid",
                                            width: "1px",
                                            color: "{color.border}",
                                        },
                                        boxShadow: {
                                            x: "0",
                                            y: "2px",
                                            blur: "4px",
                                            color: "rgba(0,0,0,0.1)",
                                        },
                                        cursor: "pointer",
                                    },
                                },
                                children: [
                                    {
                                        id: "iconPrev",
                                        kind: "element",
                                        tag: "icon",
                                        name: "Icon",
                                        props: { name: "ChevronLeft" },
                                        style: {
                                            base: {
                                                width: "16px",
                                                height: "16px",
                                                color: "{color.text}",
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                id: "arrowNext",
                                kind: "element",
                                tag: "button",
                                name: "Next Arrow",
                                props: { action: "carousel-next" },
                                style: {
                                    base: {
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: { kind: "color", color: "{color.surface}" },
                                        borderRadius: { all: "50%" },
                                        border: {
                                            style: "solid",
                                            width: "1px",
                                            color: "{color.border}",
                                        },
                                        boxShadow: {
                                            x: "0",
                                            y: "2px",
                                            blur: "4px",
                                            color: "rgba(0,0,0,0.1)",
                                        },
                                        cursor: "pointer",
                                    },
                                },
                                children: [
                                    {
                                        id: "iconNext",
                                        kind: "element",
                                        tag: "icon",
                                        name: "Icon",
                                        props: { name: "ChevronRight" },
                                        style: {
                                            base: {
                                                width: "16px",
                                                height: "16px",
                                                color: "{color.text}",
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: "carouselDots",
                        kind: "element",
                        tag: "stack",
                        name: "Pagination",
                        visibleIf: { key: dotsKey, equals: true },
                        style: {
                            base: {
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "{space.2}",
                            },
                        },
                        children: [
                            {
                                id: "carouselDot",
                                kind: "element",
                                tag: "button",
                                name: "Dot",
                                props: { action: "carousel-dot" },
                                repeat: { source: "self", path: itemsPath },
                                style: {
                                    base: {
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: { all: "50%" },
                                        cursor: "pointer",
                                        background: { kind: "color", color: "{color.border}" },
                                        border: { style: "none" },
                                        padding: { all: "0" },
                                        transition: {
                                            property: ["width", "background-color"],
                                            duration: 200,
                                            easing: "ease",
                                        },
                                    },
                                },
                                activeStyle: {
                                    base: {
                                        width: "20px",
                                        background: { kind: "color", color: "{color.primary}" },
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    };
}
