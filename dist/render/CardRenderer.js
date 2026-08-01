"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRenderer = CardRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const node_1 = require("../types/node");
const BlockRenderer_1 = require("./BlockRenderer");
const NodeRenderer_1 = require("./NodeRenderer");
function CardRenderer({ definition, content, card, links, isEditing, gatedWidgetKeys, onTrack, onActionClick, blocks, theme, }) {
    const placeholder = react_1.default.useMemo(() => {
        if (isEditing || !blocks || blocks.length === 0)
            return null;
        let optionalId = null;
        let copyrightId = null;
        (0, node_1.walkNodes)(definition.root, (n) => {
            if (optionalId)
                return;
            if ((0, node_1.isWidget)(n)) {
                const w = (n.widget || '').toUpperCase();
                if (w === 'COPYRIGHT' && !copyrightId) {
                    copyrightId = n.id;
                }
                const isCoreWidget = [
                    'PROFILE',
                    'CONNECT_BUTTONS',
                    'HEADER',
                    'NAV',
                    'CONTACT_LINKS',
                    'CONTACT_BUTTONS',
                    'LINK_BUTTONS',
                    'CUSTOM_LINKS',
                    'LINKS',
                    'SOCIAL_ICONS',
                    'SOCIAL_LINKS',
                    'SOCIAL',
                    'COPYRIGHT',
                ].includes(w);
                if (!isCoreWidget)
                    optionalId = n.id;
            }
        });
        if (optionalId)
            return { id: optionalId, injectBefore: false };
        if (copyrightId)
            return { id: copyrightId, injectBefore: true };
        return null;
    }, [definition.root, isEditing, blocks]);
    const ctx = {
        card,
        links,
        blocks,
        isEditing,
        gatedWidgetKeys,
        track: onTrack || (() => { }),
        onActionClick,
        rootId: definition.root.id,
        placeholderId: placeholder?.id || null,
        injectBefore: placeholder?.injectBefore || false,
        renderUserBlocks: () => {
            if (!blocks || blocks.length === 0)
                return null;
            const blockCtx = { ...ctx, renderUserBlocks: undefined, isRenderingUserBlocks: true };
            return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: blocks
                    .filter((b) => b.hidden !== true && b.isVisible !== false)
                    .map((b) => {
                    const normalizedBlock = {
                        ...b,
                        widget: b.widget || b.type,
                    };
                    return ((0, jsx_runtime_1.jsx)(BlockRenderer_1.BlockRenderer, { definition: definition, block: normalizedBlock, ctx: blockCtx }, b.id));
                }) }));
        },
    };
    // ── Template design render (admin preview / public page from the tree) ──
    return ((0, jsx_runtime_1.jsxs)("div", { className: "ts-card", style: themeRootStyle(theme), children: [(0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: definition.root, content: content, ctx: ctx }), definition.popups?.map((popup) => ((0, jsx_runtime_1.jsx)("div", { className: "ts-popup", hidden: true, children: (0, jsx_runtime_1.jsx)(NodeRenderer_1.NodeRenderer, { node: popup.root, content: content, ctx: ctx }) }, popup.key)))] }));
}
/**
 * The two Theme knobs that aren't token overrides: font-weight and layout are
 * applied at the root here (the colour/font/radius/density vars come from
 * `compileCardTheme`, injected by the host in the `ts-override` layer).
 */
function themeRootStyle(theme) {
    if (!theme)
        return undefined;
    const style = {};
    if (typeof theme.fontWeight === 'number')
        style.fontWeight = theme.fontWeight;
    if (theme.layout === 'center')
        style.textAlign = 'center';
    else if (theme.layout === 'left')
        style.textAlign = 'left';
    return Object.keys(style).length ? style : undefined;
}
