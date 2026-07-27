/**
 * PROFILE — the card's identity header as a single widget.
 *
 * `derived: true` means it holds no content of its own: it reads General Info
 * off the card. An admin who wants a bespoke header composes primitives with
 * bindings instead (see `Binding` in types/node.ts); this widget exists for the
 * common case where they just want the standard block with design control.
 */
import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'PROFILE',
  label: 'Profile',
  iconName: 'User',
  group: 'identity',
  description: 'Avatar, name, title and bio pulled from General Info.',
  contentVersion: 1,
  derived: true,
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'cover', label: 'Cover photo' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'logo', label: 'Company logo' },
    { key: 'name', label: 'Name' },
    { key: 'subtitle', label: 'Job title / company' },
    { key: 'bio', label: 'Bio' },
    { key: 'location', label: 'Location' },
    { key: 'actions', label: 'Action row' },
    { key: 'action', label: 'Action button' },
  ],
  designSchema: [
    { key: 'showCover', type: 'boolean', label: 'Show cover photo' },
    { key: 'showAvatar', type: 'boolean', label: 'Show avatar' },
    { key: 'showLogo', type: 'boolean', label: 'Show company logo' },
    { key: 'showBio', type: 'boolean', label: 'Show bio' },
    { key: 'showLocation', type: 'boolean', label: 'Show location' },
    {
      key: 'align', type: 'select', label: 'Alignment',
      options: [
        { value: 'center', label: 'Centered' },
        { value: 'left', label: 'Left' },
      ],
    },
    {
      key: 'actions', type: 'select', label: 'Action buttons', multiple: true,
      options: [
        { value: 'vcard', label: 'Save contact' },
        { value: 'share', label: 'Share' },
        { value: 'qr', label: 'QR code' },
      ],
    },
  ],
  contentSchema: [],
  /**
   * The DOM here is FLAT — cover, avatar, name and bio are all siblings, with
   * no inner wrapper to hang padding on. So the root stays edge-to-edge (which
   * is what lets the cover photo bleed full-width) and each text part carries
   * its own inline padding. That avoids negative-margin tricks, which the value
   * serializer would reject anyway: `-{space.4}` is not a valid token ref.
   */
  defaultPartStyles: {
    root: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '{space.2}',
        padding: { t: '0', r: '0', b: '{space.5}', l: '0' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' },
        overflow: 'hidden',
        textAlign: 'center',
      },
    },
    cover: {
      base: { width: '100%', height: '120px', objectFit: 'cover' },
    },
    avatar: {
      base: {
        width: '88px',
        height: '88px',
        objectFit: 'cover',
        borderRadius: { all: '{radius.full}' },
        border: { width: '3px', style: 'solid', color: '{color.surface}' },
        boxShadow: '{shadow.md}',
        // Overlaps the cover — the look every v1 template hand-rolled.
        margin: { t: '-56px', b: '{space.1}' },
      },
    },
    logo: {
      base: { height: '28px', width: 'auto', objectFit: 'contain' },
    },
    name: {
      base: {
        fontFamily: '{font.heading}',
        fontSize: '{size.xl}',
        fontWeight: 700,
        color: '{color.text}',
        lineHeight: 1.2,
        padding: { r: '{space.4}', l: '{space.4}' },
      },
    },
    subtitle: {
      base: {
        fontSize: '{size.sm}',
        fontWeight: 500,
        color: '{color.muted}',
        padding: { r: '{space.4}', l: '{space.4}' },
      },
    },
    bio: {
      base: {
        fontSize: '{size.sm}',
        color: '{color.muted}',
        lineHeight: 1.55,
        padding: { t: '{space.1}', r: '{space.5}', b: '0', l: '{space.5}' },
      },
    },
    location: {
      base: {
        fontSize: '{size.xs}',
        color: '{color.muted}',
        padding: { r: '{space.4}', l: '{space.4}' },
      },
    },
    actions: {
      base: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '{space.2}',
        width: '100%',
        padding: { t: '{space.2}', r: '{space.4}', b: '0', l: '{space.4}' },
      },
    },
    action: {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '{space.2}',
        flexGrow: 1,
        padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
        background: { kind: 'color', color: '{color.primary}' },
        color: '{color.onPrimary}',
        borderRadius: { all: '{radius.md}' },
        fontSize: '{size.sm}',
        fontWeight: 600,
        cursor: 'pointer',
        transition: { property: ['opacity'], duration: 150, easing: 'ease' },
      },
      hover: { opacity: 0.88 },
    },
  },
  defaultDesign: {
    showCover: true,
    showAvatar: true,
    showLogo: true,
    showBio: true,
    showLocation: false,
    align: 'center',
    actions: ['vcard'],
  },
  defaultContent: {},
};

export const previews = {
  empty: {},
  typical: {},
  stress: {},
};
