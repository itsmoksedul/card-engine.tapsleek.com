import type { Binding } from '../types/node';

/**
 * Resolve a node's binding to a rendered value.
 *
 * Not every `CardField` is a column on the card. `fullName` is assembled from
 * first + last, and the URL fields are derived from the slug / share key — a
 * naive `card[field]` lookup returns undefined for all of them, which combined
 * with `hideIfEmpty` silently deletes the owner's name from every template
 * that binds it.
 */
export function resolveBinding(
  binding: Binding | undefined,
  card: any,
  content: any,
  selfData?: any,
): any {
  if (!binding) return undefined;

  if (binding.source === 'card') {
    return resolveCardField(binding.field, card);
  }

  if (binding.source === 'widget') {
    const widgetData = content?.[binding.key];
    if (!widgetData) return undefined;
    // Dot path, array indices included — "items.0.name".
    let result: any = widgetData;
    for (const part of binding.path.split('.')) {
      if (result == null) break;
      result = result[part];
    }
    return result;
  }

  if (binding.source === 'self') {
    let result: any = selfData !== undefined ? selfData : content;
    for (const part of binding.path.split('.')) {
      if (result == null) break;
      result = result[part];
    }
    if ((result == null || (Array.isArray(result) && result.length === 0)) && card) {
      if (binding.path === 'links' && (card.links || content?.links)) {
        return card.links || content?.links;
      }
      if (card[binding.path]) {
        return card[binding.path];
      }
    }
    return result;
  }

  if (binding.source === 'token') {
    return `var(--${binding.path.replace('.', '-')})`;
  }

  return undefined;
}

function base(): string {
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CARD_BASE_URL) ||
    'https://tapsleek.me';
  return String(url).replace(/\/+$/, '');
}

function resolveCardField(field: string, card: any): any {
  if (!card) return undefined;

  switch (field) {
    // Assembled, not stored.
    case 'fullName': {
      const name = [card.firstName, card.lastName].filter(Boolean).join(' ').trim();
      return name || card.name || undefined;
    }

    // Derived from the slug / share key.
    case 'publicUrl':
      return card.slug ? `${base()}/${card.slug}` : undefined;
    case 'shareUrl':
      return card.shareKey ? `${base()}/k/${card.shareKey}` : undefined;
    case 'vcardUrl':
      return card.slug ? `${base()}/${card.slug}/vcard` : undefined;
    case 'qrUrl':
      return card.slug ? `${base()}/${card.slug}/qr` : undefined;

    default: {
      const value = card[field];
      // Normalise '' to undefined so `hideIfEmpty` behaves the same whether a
      // field is missing or merely blank.
      return value === '' ? undefined : value;
    }
  }
}
