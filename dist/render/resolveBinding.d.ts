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
export declare function resolveBinding(binding: Binding | undefined, card: any, content: any): any;
