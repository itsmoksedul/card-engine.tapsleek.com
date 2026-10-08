import type { ElementNode, Node } from '../types/node';
import type { CustomBlockField, TemplateCustomBlock } from '../types/definition';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Deep clone an element node tree while ensuring node IDs are scoped
 * to prevent collision with card root or other blocks.
 */
function cloneAndScopeTree(node: Node, prefix: string): Node {
  const cloned = JSON.parse(JSON.stringify(node)) as Node;

  function walk(n: any) {
    if (!n || typeof n !== 'object') return;
    if (n.id) {
      if (n.id === 'root' || n.id.includes('root')) {
        n.id = `${prefix}_${n.id}`;
      }
    }
    if (Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
    if (n.layout) {
      walk(n.layout);
    }
  }

  walk(cloned);
  return cloned;
}

/**
 * Inspects an ElementNode (e.g. a Frame/Group) and discovers all editable
 * content fields (headings, texts, images, videos, buttons, and inner widgets).
 */
export function extractFieldsFromNode(rootNode: Node): {
  fields: CustomBlockField[];
  defaultContent: Record<string, unknown>;
} {
  const fields: CustomBlockField[] = [];
  const defaultContent: Record<string, unknown> = {};
  const seenKeys = new Set<string>();

  function uniqueKey(base: string): string {
    let key = base;
    let idx = 1;
    while (seenKeys.has(key)) {
      idx++;
      key = `${base}_${idx}`;
    }
    seenKeys.add(key);
    return key;
  }

  function walk(n: Node) {
    if (n.kind === 'element') {
      const tag = n.tag;
      const label = n.name || n.id;

      if (tag === 'heading') {
        const k = uniqueKey('title');
        const textVal = String(n.props?.text ?? n.props?.content ?? 'Heading');
        fields.push({
          nodeId: n.id,
          key: k,
          label: label !== n.id ? label : 'Heading Text',
          type: 'text',
          default: textVal,
        });
        defaultContent[k] = textVal;
        // Bind node to this self key
        n.bind = { source: 'self', path: k };
      } else if (tag === 'text' || tag === 'richtext') {
        const k = uniqueKey('description');
        const textVal = String(n.props?.text ?? n.props?.content ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: label !== n.id ? label : 'Text / Description',
          type: 'textarea',
          default: textVal,
        });
        defaultContent[k] = textVal;
        n.bind = { source: 'self', path: k };
      } else if (tag === 'video') {
        const k = uniqueKey('videoUrl');
        const urlVal = String(n.props?.url ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: label !== n.id ? label : 'Video URL',
          type: 'video',
          default: urlVal,
        });
        defaultContent[k] = urlVal;
        n.bind = { source: 'self', path: k };
      } else if (tag === 'image') {
        const k = uniqueKey('imageUrl');
        const srcVal = String(n.props?.src ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: label !== n.id ? label : 'Image URL',
          type: 'image',
          default: srcVal,
        });
        defaultContent[k] = srcVal;
        n.bind = { source: 'self', path: k };
      } else if (tag === 'button' || tag === 'link') {
        if (n.props?.text || n.props?.label) {
          const kLabel = uniqueKey('buttonText');
          const btnLabel = String(n.props?.label ?? n.props?.text ?? 'Click here');
          fields.push({
            nodeId: n.id,
            key: kLabel,
            label: `${label} Label`,
            type: 'text',
            default: btnLabel,
          });
          defaultContent[kLabel] = btnLabel;
          n.bind = { source: 'self', path: kLabel };
        }
        if (n.props?.url || n.props?.href) {
          const kUrl = uniqueKey('buttonUrl');
          const btnUrl = String(n.props?.url ?? n.props?.href ?? '');
          fields.push({
            nodeId: n.id,
            key: kUrl,
            label: `${label} URL`,
            type: 'url',
            default: btnUrl,
          });
          defaultContent[kUrl] = btnUrl;
        }
      }

      if (Array.isArray(n.children)) {
        n.children.forEach(walk);
      }
    } else if (n.kind === 'widget') {
      const widgetType = (n.widget || '').toUpperCase();
      const label = n.label || n.name || widgetType;
      const defContent = (n.defaultContent || {}) as Record<string, any>;

      if (widgetType === 'VIDEO') {
        const k = uniqueKey('videoUrl');
        const urlVal = String(defContent.url ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: `${label} URL`,
          type: 'video',
          default: urlVal,
        });
        defaultContent[k] = urlVal;
        n.key = k;
      } else if (widgetType === 'TITLE' || widgetType === 'HEADING') {
        const k = uniqueKey('title');
        const textVal = String(defContent.text ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: `${label} Text`,
          type: 'text',
          default: textVal,
        });
        defaultContent[k] = textVal;
        n.key = k;
      } else if (widgetType === 'DESCRIPTION' || widgetType === 'RICH_TEXT') {
        const k = uniqueKey('description');
        const textVal = String(defContent.text ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: `${label} Text`,
          type: 'textarea',
          default: textVal,
        });
        defaultContent[k] = textVal;
        n.key = k;
      } else if (widgetType === 'MAP' || widgetType === 'MAPS') {
        const k = uniqueKey('address');
        const addrVal = String(defContent.address ?? '');
        fields.push({
          nodeId: n.id,
          key: k,
          label: `${label} Address`,
          type: 'text',
          default: addrVal,
        });
        defaultContent[k] = addrVal;
        n.key = k;
      }
    }
  }

  walk(rootNode);
  return { fields, defaultContent };
}

/**
 * Creates a TemplateCustomBlock from a selected Frame/Container node.
 */
export function createCustomBlockFromNode(
  node: ElementNode,
  label: string,
  icon: string = 'Layout',
  description?: string,
): TemplateCustomBlock {
  const safeIdBase = slugify(label) || 'block';
  const blockId = `block_${safeIdBase}_${Math.random().toString(36).slice(2, 6)}`;
  
  // Clone node tree and ensure IDs are scoped to this block
  const cloned = cloneAndScopeTree(node, blockId) as ElementNode;
  
  // Discover fields and bind editable leaves to self keys
  const { fields, defaultContent } = extractFieldsFromNode(cloned);

  return {
    id: blockId,
    label: label.trim() || 'Custom Block',
    icon: icon || 'Layout',
    description: description || `Custom block based on ${node.name || 'group'}`,
    sourceNodeId: node.id,
    layout: cloned,
    fields,
    defaultContent,
  };
}
