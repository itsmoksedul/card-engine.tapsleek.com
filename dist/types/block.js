"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
