import React from 'react';
import { type WidgetRenderProps } from './shared';
/**
 * PROFILE — the card's identity header.
 *
 * Derived: it stores nothing of its own and reads General Info straight off the
 * card. Every field the `Card` model exposes is represented here, so an admin
 * can switch pieces on and off without needing a second widget:
 *
 *   coverPhoto   → cover      firstName+lastName → name
 *   profileImage → avatar     jobTitle+companyName → subtitle
 *   companyLogo  → logo       bio → bio        location → location
 *
 * `actions` wires the native card behaviours (Save contact / Share / QR),
 * which is what replaced the hardcoded "SAVE AS CONTACT" button in v1.
 */
export declare function ProfileRender({ design, cls, ctx }: WidgetRenderProps): React.JSX.Element;
