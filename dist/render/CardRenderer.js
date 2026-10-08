"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRenderer = CardRenderer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const node_1 = require("../types/node");
const registry_1 = require("../widgets/registry");
const BlockRenderer_1 = require("./BlockRenderer");
const card_visibility_1 = require("./card-visibility");
const NodeRenderer_1 = require("./NodeRenderer");
function CardRenderer({ definition, content, card, links, isEditing, gatedWidgetKeys, onTrack, onActionClick, blocks, theme, showPlaceholders, }) {
    const effectiveShowPlaceholders = Boolean(showPlaceholders ?? card?.showPlaceholders ?? isEditing);
    // Map user blocks to specific template widget nodes so separate boxes designed
    // in Admin builder are preserved and each block renders in its designated container.
    const { blockNodeMap, unmatchedBlocks, placeholder, blockPositionMap } = react_1.default.useMemo(() => {
        const map = new Map();
        if (isEditing || !blocks || blocks.length === 0) {
            return { blockNodeMap: map, unmatchedBlocks: [], placeholder: null, blockPositionMap: new Map() };
        }
        const activeBlocks = [...blocks]
            .filter((b) => b.hidden !== true && b.isVisible !== false)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        // Collect all widget nodes in the template
        const templateWidgets = [];
        (0, node_1.walkNodes)(definition.root, (n) => {
            if ((0, node_1.isWidget)(n)) {
                templateWidgets.push({ node: n, claimed: false });
            }
        });
        const remainingBlocks = [];
        // Pass 1: Match by exact ID or key
        for (const b of activeBlocks) {
            const match = templateWidgets.find((tw) => !tw.claimed &&
                (tw.node.id === b.id ||
                    tw.node.key === b.id ||
                    b.nodeId === tw.node.id));
            if (match) {
                match.claimed = true;
                map.set(match.node.id, b);
            }
            else {
                remainingBlocks.push(b);
            }
        }
        // Pass 2: Match by widget type (for non-core widgets or custom blocks)
        const unmatched = [];
        for (const b of remainingBlocks) {
            const rawType = b.widget || b.type || "";
            const normType = (0, registry_1.normalizeWidgetType)(rawType);
            const rawTypeLower = rawType.toLowerCase();
            const match = templateWidgets.find((tw) => {
                if (tw.claimed)
                    return false;
                const twType = (tw.node.widget || "").toUpperCase();
                if ((0, card_visibility_1.isCoreWidget)(twType))
                    return false;
                // Case-insensitive match to handle custom blocks like "About Us" vs "about-us"
                return ((0, registry_1.normalizeWidgetType)(tw.node.widget) === normType ||
                    tw.node.widget === rawType ||
                    tw.node.widget.toLowerCase() === rawTypeLower);
            });
            if (match) {
                match.claimed = true;
                map.set(match.node.id, b);
            }
            else {
                unmatched.push(b);
            }
        }
        // Pass 3: If any blocks remain unmatched, find a placeholder widget node
        let placeholderResult = null;
        if (unmatched.length > 0) {
            const unclaimedNonCore = templateWidgets.find((tw) => !tw.claimed && !(0, card_visibility_1.isCoreWidget)(tw.node.widget));
            if (unclaimedNonCore) {
                placeholderResult = {
                    id: unclaimedNonCore.node.id,
                    injectBefore: false,
                };
            }
            else {
                const copyrightWidget = templateWidgets.find((tw) => (tw.node.widget || "").toUpperCase() === "COPYRIGHT");
                if (copyrightWidget) {
                    placeholderResult = {
                        id: copyrightWidget.node.id,
                        injectBefore: true,
                    };
                }
            }
        }
        // Build a node.id → block.position map for widget children sorting
        const blockPositionMap = new Map();
        for (const [nodeId, block] of map.entries()) {
            blockPositionMap.set(nodeId, block.position ?? 0);
        }
        return {
            blockNodeMap: map,
            unmatchedBlocks: unmatched,
            placeholder: placeholderResult,
            blockPositionMap,
        };
    }, [definition.root, isEditing, blocks]);
    // Section frames left empty once unused widgets are hidden (blank boxes).
    const collapsedIds = react_1.default.useMemo(() => (0, card_visibility_1.collectCollapsedIds)(definition.root, {
        links,
        blocks,
        blockNodeMap,
        isEditing,
        gatedWidgetKeys,
        placeholderId: placeholder?.id || null,
        injectBefore: placeholder?.injectBefore || false,
        showPlaceholders: effectiveShowPlaceholders,
    }), [
        definition.root,
        links,
        blocks,
        blockNodeMap,
        isEditing,
        gatedWidgetKeys,
        placeholder,
        effectiveShowPlaceholders,
    ]);
    const ctx = {
        card: {
            ...card,
            showPlaceholders: effectiveShowPlaceholders,
            links: links ?? card?.links,
        },
        links,
        blocks,
        blockNodeMap,
        blockPositionMap,
        isEditing,
        gatedWidgetKeys,
        track: onTrack || (() => { }),
        onActionClick,
        rootId: definition.root.id,
        placeholderId: placeholder?.id || null,
        injectBefore: placeholder?.injectBefore || false,
        collapsedIds,
        renderBlock: (block) => {
            const normalizedBlock = {
                ...block,
                widget: (0, registry_1.normalizeWidgetType)(block.widget || block.type),
            };
            return ((0, jsx_runtime_1.jsx)(BlockRenderer_1.BlockRenderer, { definition: definition, block: normalizedBlock, ctx: {
                    ...ctx,
                    renderUserBlocks: undefined,
                    isRenderingUserBlocks: true,
                    collapsedIds: undefined,
                } }, block.id));
        },
        renderUserBlocks: () => {
            if (!unmatchedBlocks || unmatchedBlocks.length === 0)
                return null;
            const blockCtx = {
                ...ctx,
                renderUserBlocks: undefined,
                isRenderingUserBlocks: true,
                collapsedIds: undefined,
            };
            return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: unmatchedBlocks
                    .filter((b) => b.hidden !== true && b.isVisible !== false)
                    .map((b) => {
                    const normalizedBlock = {
                        ...b,
                        widget: (0, registry_1.normalizeWidgetType)(b.widget || b.type),
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
