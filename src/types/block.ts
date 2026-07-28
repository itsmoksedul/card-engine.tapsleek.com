/**
 * Block types — the USER's side of the card (v2.1).
 *
 * A card is a template (design) + an ordered list of BLOCKS (content) + a global
 * THEME. Blocks are deliberately generic: `widget` is just a type string and
 * `content` is arbitrary per-widget JSON, so a brand-new widget is a `WidgetDef`
 * in the engine and needs ZERO database migration — exactly like the template's
 * node tree stores widgets.
 *
 * A block never stores design. Its look comes from the card's template
 * (`resolveBlockDesign`), so the user composes content and the admin owns style.
 */

/** One user-placed content block. */
export interface BlockInstance {
  /** Stable, unique on the card. */
  id: string;
  /** Widget TYPE — a string, not an enum. Resolved against the registry. */
  widget: string;
  /** Arbitrary per-widget content (validated by the WidgetDef's contentSchema). */
  content?: unknown;
  /** User visibility toggle. */
  hidden?: boolean;
}

/**
 * The user-controlled, card-wide look. Applied as a token-override layer over
 * the template — the only design surface a card owner touches.
 */
export interface CardTheme {
  /** Token colour overrides, e.g. `{ primary: "#E11D48", text: "#111" }`. */
  colors?: Record<string, string>;
  /** Overrides both `--f-heading` and `--f-body`. */
  fontFamily?: string;
  /** 100–900. Applied at the card root. */
  fontWeight?: number;
  /** Element arrangement hint, e.g. `"center"` | `"left"`. */
  layout?: string;
  /** Vertical whitespace between blocks, px (maps to the base spacing token). */
  density?: number;
  /** Global corner radius, px (maps to the radius tokens). */
  radius?: number;
}
