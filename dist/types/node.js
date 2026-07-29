"use strict";
/**
 * Node types — the template tree.
 *
 * Three kinds only:
 *   element  pure design primitive, never user-editable
 *   widget   composite, data-driven, the ONLY user-editable unit
 *   slot     a region where the user may add widgets from a whitelist
 *
 * A node's `id` doubles as its CSS class (`.n<id>`), which is how a locked
 * design and a shared component can produce completely different looks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARD_FIELDS = exports.VOID_TAGS = exports.CONTAINER_TAGS = void 0;
exports.isElement = isElement;
exports.isWidget = isWidget;
exports.isSlot = isSlot;
exports.walkNodes = walkNodes;
exports.collectWidgets = collectWidgets;
exports.collectSlots = collectSlots;
exports.walkTreeOrder = walkTreeOrder;
exports.findNode = findNode;
exports.countNodes = countNodes;
exports.maxDepth = maxDepth;
exports.CONTAINER_TAGS = ['frame', 'stack', 'grid', 'link'];
exports.VOID_TAGS = [
    'heading',
    'text',
    'richtext',
    'image',
    'icon',
    'button',
    'divider',
    'spacer',
    'embed',
    'video',
];
exports.CARD_FIELDS = [
    'fullName',
    'firstName',
    'lastName',
    'bio',
    'jobTitle',
    'companyName',
    'location',
    'profileImage',
    'coverPhoto',
    'companyLogo',
    'publicUrl',
    'vcardUrl',
    'qrUrl',
    'shareUrl',
];
// ─── Traversal helpers ───────────────────────────────────────────────────────
function isElement(n) {
    return n.kind === 'element';
}
function isWidget(n) {
    return n.kind === 'widget';
}
function isSlot(n) {
    return n.kind === 'slot';
}
/** Depth-first walk over the tree. `parent` is null for the root. */
function walkNodes(root, visit) {
    const stack = [
        { node: root, parent: null, depth: 0 },
    ];
    while (stack.length) {
        const { node, parent, depth } = stack.pop();
        visit(node, parent, depth);
        if (isElement(node) && node.children?.length) {
            for (let i = node.children.length - 1; i >= 0; i--) {
                stack.push({ node: node.children[i], parent: node, depth: depth + 1 });
            }
        }
    }
}
/** Every widget node in tree order. */
function collectWidgets(root) {
    const out = [];
    walkTreeOrder(root, (n) => {
        if (isWidget(n))
            out.push(n);
    });
    return out;
}
/** Every slot node in tree order. */
function collectSlots(root) {
    const out = [];
    walkTreeOrder(root, (n) => {
        if (isSlot(n))
            out.push(n);
    });
    return out;
}
/** Depth-first walk that preserves document order (unlike the stack version). */
function walkTreeOrder(node, visit, depth = 0) {
    visit(node, depth);
    if (isElement(node) && node.children) {
        for (const child of node.children)
            walkTreeOrder(child, visit, depth + 1);
    }
}
function findNode(root, id) {
    let found = null;
    walkNodes(root, (n) => {
        if (!found && n.id === id)
            found = n;
    });
    return found;
}
function countNodes(root) {
    let n = 0;
    walkNodes(root, () => n++);
    return n;
}
function maxDepth(root) {
    let max = 0;
    walkNodes(root, (_n, _p, d) => {
        if (d > max)
            max = d;
    });
    return max;
}
