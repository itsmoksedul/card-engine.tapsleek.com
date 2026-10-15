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
// `video` holds its click-to-play cover layers (thumbnail, play button…).
export const CONTAINER_TAGS = ['frame', 'stack', 'grid', 'link', 'carousel', 'carousel-root', 'video'];
export const VOID_TAGS = [
    'heading',
    'text',
    'richtext',
    'image',
    'icon',
    'button',
    'divider',
    'spacer',
    'embed',
];
export const CARD_FIELDS = [
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
export const BINDING_FORMATS = [
    'weekday',
    'hoursRange',
    'appointmentUrl',
    'mapAddress',
    'mapEmbed',
    'mapDirectionsUrl',
    'pad2',
];
// ─── Traversal helpers ───────────────────────────────────────────────────────
export function isElement(n) {
    return n.kind === 'element';
}
export function isWidget(n) {
    return n.kind === 'widget';
}
export function isSlot(n) {
    return n.kind === 'slot';
}
/** Depth-first walk over the tree. `parent` is null for the root. */
export function walkNodes(root, visit) {
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
/** Every widget node in tree order, including widgets nested in a widget's layout. */
export function collectWidgets(root) {
    const out = [];
    walkTreeWithLayouts(root, (n) => {
        if (isWidget(n))
            out.push(n);
    });
    return out;
}
/** Every slot node in tree order, including slots nested in a widget's layout. */
export function collectSlots(root) {
    const out = [];
    walkTreeWithLayouts(root, (n) => {
        if (isSlot(n))
            out.push(n);
    });
    return out;
}
/**
 * `walkTreeOrder` that also descends into each widget's stored `layout`, so a
 * widget the admin placed inside another widget (e.g. Connect Buttons inside
 * Profile) is visited too. Layout element nodes are visited as well.
 */
export function walkTreeWithLayouts(node, visit, depth = 0) {
    visit(node, depth);
    if (isElement(node) && node.children) {
        for (const child of node.children) {
            walkTreeWithLayouts(child, visit, depth + 1);
        }
    }
    if (isWidget(node) && node.layout) {
        walkTreeWithLayouts(node.layout, visit, depth + 1);
    }
}
/** Depth-first walk that preserves document order (unlike the stack version). */
export function walkTreeOrder(node, visit, depth = 0) {
    visit(node, depth);
    if (isElement(node) && node.children) {
        for (const child of node.children)
            walkTreeOrder(child, visit, depth + 1);
    }
}
export function findNode(root, id) {
    let found = null;
    walkNodes(root, (n) => {
        if (!found && n.id === id)
            found = n;
    });
    return found;
}
export function countNodes(root) {
    let n = 0;
    walkNodes(root, () => n++);
    return n;
}
export function maxDepth(root) {
    let max = 0;
    walkNodes(root, (_n, _p, d) => {
        if (d > max)
            max = d;
    });
    return max;
}
