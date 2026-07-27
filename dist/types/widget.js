"use strict";
/**
 * WidgetMeta — the JSON-serializable half of a widget.
 *
 * A widget is deliberately split in two:
 *   meta.ts    (this shape)  pure data — imported by NestJS AND every frontend
 *   Render.tsx               React only — imported by frontends only
 *
 * That split is what lets the backend validate user content, lint a template
 * on publish and serve the builder palette (`GET /admin/widgets`) without ever
 * importing React. It also guarantees the palette can't drift from the
 * implementations, because it IS the implementations' metadata.
 *
 * NOTE: `iconName` is a string (a lucide key), never a component — the
 * manifest has to survive JSON.stringify.
 */
Object.defineProperty(exports, "__esModule", { value: true });
