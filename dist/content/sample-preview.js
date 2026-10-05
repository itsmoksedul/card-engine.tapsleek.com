"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_PREVIEW_ASSETS = void 0;
exports.generatePreviewCard = generatePreviewCard;
exports.generatePreviewContent = generatePreviewContent;
exports.generatePreviewLinks = generatePreviewLinks;
exports.DEMO_PREVIEW_ASSETS = {
    avatar: "data:image/svg+xml;utf8," +
        encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect width="240" height="240" fill="url(#a)"/><circle cx="120" cy="96" r="42" fill="#fff" opacity=".9"/><path d="M32 240c0-48 40-72 88-72s88 24 88 72z" fill="#fff" opacity=".9"/></svg>'),
    cover: "data:image/svg+xml;utf8," +
        encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="460"><defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset=".55" stop-color="#3730a3"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="900" height="460" fill="url(#c)"/><circle cx="740" cy="90" r="150" fill="#fff" opacity=".07"/><circle cx="140" cy="400" r="190" fill="#fff" opacity=".05"/></svg>'),
    logo: "data:image/svg+xml;utf8," +
        encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="26" fill="#111827"/><path d="M34 78V42h16a14 14 0 0 1 0 28H44v8z" fill="#fff"/><circle cx="82" cy="70" r="9" fill="#6366f1"/></svg>'),
};
function generatePreviewCard(definition, profile = "typical") {
    if (profile === "empty") {
        return {
            firstName: "",
            lastName: "",
            jobTitle: "",
            companyName: "",
            bio: "",
            location: "",
            profileImage: "",
            coverPhoto: "",
            companyLogo: "",
            slug: "preview",
            shareKey: "previewkey",
        };
    }
    const base = profile === "stress"
        ? {
            firstName: "Bartholomew Maximilian",
            lastName: "Featherstonehaugh-Wellington",
            jobTitle: "Senior Principal Director of Strategic Partnerships and Business Development",
            companyName: "Wellington Featherstonehaugh International Holdings Limited",
            bio: "A".repeat(320),
            location: "Chittagong Hill Tracts, Chattogram Division, Bangladesh",
            profileImage: exports.DEMO_PREVIEW_ASSETS.avatar,
            coverPhoto: exports.DEMO_PREVIEW_ASSETS.cover,
            companyLogo: exports.DEMO_PREVIEW_ASSETS.logo,
            slug: "preview",
            shareKey: "previewkey",
        }
        : {
            firstName: "Alex",
            lastName: "Morgan",
            jobTitle: "Business Consultant",
            companyName: "Acme Studio",
            bio: "A business consultant is a professional expert who provides advice and strategies to help organizations improve their performance.",
            location: "Dhaka, Bangladesh",
            profileImage: exports.DEMO_PREVIEW_ASSETS.avatar,
            coverPhoto: exports.DEMO_PREVIEW_ASSETS.cover,
            companyLogo: exports.DEMO_PREVIEW_ASSETS.logo,
            slug: "preview",
            shareKey: "previewkey",
        };
    if (!definition?.root)
        return base;
    const overrides = {};
    const walk = (node) => {
        const n = node;
        if (n?.design || n?.defaultContent) {
            const src = { ...(n.design ?? {}), ...(n.defaultContent ?? {}) };
            if (src.profileImage)
                overrides.profileImage = src.profileImage;
            if (src.coverPhoto)
                overrides.coverPhoto = src.coverPhoto;
            if (src.companyLogo)
                overrides.companyLogo = src.companyLogo;
            if (src.avatar)
                overrides.profileImage = src.avatar;
            if (src.cover)
                overrides.coverPhoto = src.cover;
            if (src.logo)
                overrides.companyLogo = src.logo;
            if (src.name) {
                const parts = String(src.name).split(" ");
                overrides.firstName = parts[0] ?? "";
                overrides.lastName = parts.slice(1).join(" ");
            }
            if (src.subtitle)
                overrides.jobTitle = src.subtitle;
            if (src.location)
                overrides.location = src.location;
            if (src.bio)
                overrides.bio = src.bio;
        }
        if (n?.kind === "element") {
            const bind = n.bind;
            const props = n.props ?? {};
            if (bind?.field) {
                if (bind.field === "coverPhoto" && props.src)
                    overrides.coverPhoto = props.src;
                if (bind.field === "profileImage" && props.src)
                    overrides.profileImage = props.src;
                if (bind.field === "companyLogo" && props.src)
                    overrides.companyLogo = props.src;
                if (bind.field === "fullName" && props.text) {
                    const parts = String(props.text).split(" ");
                    overrides.firstName = parts[0] ?? "";
                    overrides.lastName = parts.slice(1).join(" ");
                }
                if (bind.field === "firstName" && props.text)
                    overrides.firstName = props.text;
                if (bind.field === "lastName" && props.text)
                    overrides.lastName = props.text;
                if (bind.field === "jobTitle" && props.text)
                    overrides.jobTitle = props.text;
                if (bind.field === "companyName" && props.text)
                    overrides.companyName = props.text;
                if (bind.field === "bio" && props.text)
                    overrides.bio = props.text;
                if (bind.field === "location" && props.text)
                    overrides.location = props.text;
            }
        }
        if (n?.layout)
            walk(n.layout);
        n?.children?.forEach(walk);
    };
    walk(definition.root);
    (definition.popups ?? []).forEach((p) => walk(p.root));
    return { ...base, ...overrides };
}
function generatePreviewContent(definition, profile = "typical") {
    const out = {};
    if (!definition?.root)
        return out;
    const walk = (node) => {
        const n = node;
        if (n?.kind === "widget" && n.key) {
            const demo = { ...(n.defaultContent ?? {}), ...(n.design ?? {}) };
            out[n.key] =
                profile === "empty"
                    ? emptyLike(demo)
                    : profile === "stress"
                        ? stressLike(demo)
                        : demo;
        }
        n?.children?.forEach(walk);
        // Widgets can be nested inside another widget's layout.
        if (n?.layout)
            walk(n.layout);
    };
    walk(definition.root);
    (definition.popups ?? []).forEach((p) => walk(p.root));
    return out;
}
function generatePreviewLinks(definition, profile = "typical") {
    if (profile === "empty")
        return [];
    // Check if contact-links widget has demo links in defaultContent
    if (definition?.root) {
        let foundLinks = null;
        const walk = (node) => {
            if (foundLinks)
                return;
            const n = node;
            if (n?.kind === "widget" &&
                (n.widget === "CONTACT_LINKS" ||
                    n.widget === "LINK_BUTTONS" ||
                    n.widget === "LINKS") &&
                Array.isArray(n.defaultContent?.links) &&
                n.defaultContent.links.length > 0) {
                foundLinks = n.defaultContent.links;
            }
            n?.children?.forEach(walk);
            if (n?.layout)
                walk(n.layout);
        };
        walk(definition.root);
        if (foundLinks && foundLinks.length > 0) {
            return foundLinks.map((l, i) => ({
                ...l,
                position: i,
                isVisible: true,
            }));
        }
    }
    const base = [
        {
            id: "l1",
            type: "email",
            category: "CONTACT",
            label: "Email",
            value: "mailto:alex@example.com",
            url: "mailto:alex@example.com",
            icon: "AtSign",
            position: 0,
            isVisible: true,
        },
        {
            id: "l2",
            type: "phone",
            category: "CONTACT",
            label: "Phone",
            value: "tel:+8801700000000",
            url: "tel:+8801700000000",
            icon: "Phone",
            position: 1,
            isVisible: true,
        },
        {
            id: "l3",
            type: "linkedin",
            category: "SOCIAL_MEDIA",
            label: "LinkedIn",
            value: "https://linkedin.com",
            url: "https://linkedin.com",
            icon: "SiLinkedin",
            position: 2,
            isVisible: true,
        },
        {
            id: "l4",
            type: "website",
            category: "BUSINESS",
            label: "Website",
            value: "https://tapsleek.com",
            url: "https://tapsleek.com",
            icon: "Globe",
            position: 3,
            isVisible: true,
        },
    ];
    if (profile === "stress") {
        return Array.from({ length: 12 }, (_, i) => ({
            ...base[i % base.length],
            id: `l${i}`,
            label: `A very long link label number ${i + 1}`,
            position: i,
        }));
    }
    return base;
}
function emptyLike(value) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
        out[k] = Array.isArray(v) ? [] : typeof v === "string" ? "" : v;
    }
    return out;
}
function stressLike(value) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
        if (Array.isArray(v) && v.length) {
            out[k] = Array.from({ length: Math.min(12, Math.max(6, v.length * 3)) }, (_, i) => ({
                ...v[0],
                name: `Item with a deliberately long name ${i + 1}`,
            }));
        }
        else if (typeof v === "string" && v) {
            out[k] =
                v.length > 40
                    ? v
                    : `${v} — extended to test how this wraps on a narrow card`;
        }
        else {
            out[k] = v;
        }
    }
    return out;
}
