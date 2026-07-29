/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived: links stay a first-class DB entity because they carry per-link
 * click analytics (`CardLinkDailyStat`). The widget only decides how they look
 * and which categories appear.
 */
import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'CONTACT_LINKS',
  label: 'Link Buttons',
  iconName: 'Link2',
  group: 'system',
  description: 'Custom action & link buttons list.',
  contentVersion: 1,
  derived: true,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'list', label: 'List', kind: 'list', parentKey: 'root' },
    { key: 'item', label: 'Button', kind: 'button', parentKey: 'list' },
    { key: 'icon', label: 'Icon', kind: 'icon', parentKey: 'item' },
    { key: 'label', label: 'Label', kind: 'text', parentKey: 'item' },
    { key: 'value', label: 'Value', kind: 'text', parentKey: 'item' },
  ],
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'stack', label: 'Full-width buttons' },
        { value: 'grid-2', label: '2 columns' },
        { value: 'grid-3', label: '3 columns' },
        { value: 'icons', label: 'Icons only' },
      ],
    },
    { key: 'showIcon', type: 'boolean', label: 'Show icon' },
    { key: 'showValue', type: 'boolean', label: 'Show value under label' },
    {
      key: 'categories', type: 'select', label: 'Include categories', multiple: true,
      options: [
        { value: 'CONTACT', label: 'Contact' },
        { value: 'BUSINESS', label: 'Business' },
        { value: 'SOCIAL_MEDIA', label: 'Social' },
        { value: 'PAYMENT', label: 'Payment' },
        { value: 'MUSIC', label: 'Music' },
        { value: 'OTHER', label: 'Other' },
      ],
      hint: 'Leave empty to include every link.',
    },
    { key: 'max', type: 'number', label: 'Maximum links', min: 0, max: 50 },
  ],
  contentSchema: [],
  defaultPartStyles: {
    root: { base: { display: 'flex', flexDirection: 'column' } },
    list: { base: { display: 'flex', flexDirection: 'column', gap: '{space.2}' } },
    item: {
      base: {
        display: 'flex',
        alignItems: 'center',
        gap: '{space.3}',
        padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        border: { width: '1px', style: 'solid', color: '{color.border}' },
        borderRadius: { all: '{radius.md}' },
        color: '{color.text}',
        fontSize: '{size.base}',
        fontWeight: 500,
        cursor: 'pointer',
        transition: { property: ['background-color', 'transform'], duration: 150, easing: 'ease' },
      },
      hover: {
        background: { kind: 'color', color: '{color.bg}' },
        transform: { translateY: '-1px' },
      },
    },
    icon: {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        flexShrink: 0,
        borderRadius: { all: '{radius.full}' },
        background: { kind: 'color', color: '{color.bg}' },
        color: '{color.primary}',
      },
    },
    label: { base: { flexGrow: 1 } },
    value: { base: { fontSize: '{size.xs}', color: '{color.muted}' } },
  },
  defaultDesign: { layout: 'stack', showIcon: true, showValue: false, categories: [], max: 0 },
  defaultContent: {},
  defaultLayout: {
    kind: "element",
    id: "root",
    tag: "stack",
    name: "Link Buttons",
    style: {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "{space.2}",
        width: "100%",
      },
    },
    children: [
      {
        kind: "element",
        id: "item_1",
        tag: "link",
        name: "Call me",
        props: { href: "tel:" },
        style: {
          base: {
            display: "flex",
            alignItems: "center",
            gap: "{space.3}",
            padding: { t: "{space.3}", b: "{space.3}", r: "{space.4}", l: "{space.4}" },
            background: { kind: "color", color: "{color.surface}" },
            border: { width: "1px", style: "solid", color: "{color.border}" },
            borderRadius: { all: "{radius.md}" },
          },
        },
        children: [
          {
            kind: "element",
            id: "icon_1",
            tag: "icon",
            props: { name: "Phone", size: 18 },
            style: { base: { color: "{color.primary}" } },
          },
          {
            kind: "element",
            id: "text_1",
            tag: "text",
            props: { text: "Call me" },
            style: { base: { fontSize: "{size.sm}", fontWeight: 500 } },
          },
        ],
      },
      {
        kind: "element",
        id: "item_2",
        tag: "link",
        name: "WhatsApp",
        props: { href: "https://wa.me/" },
        style: {
          base: {
            display: "flex",
            alignItems: "center",
            gap: "{space.3}",
            padding: { t: "{space.3}", b: "{space.3}", r: "{space.4}", l: "{space.4}" },
            background: { kind: "color", color: "{color.surface}" },
            border: { width: "1px", style: "solid", color: "{color.border}" },
            borderRadius: { all: "{radius.md}" },
          },
        },
        children: [
          {
            kind: "element",
            id: "icon_2",
            tag: "icon",
            props: { name: "MessageSquare", size: 18 },
            style: { base: { color: "{color.primary}" } },
          },
          {
            kind: "element",
            id: "text_2",
            tag: "text",
            props: { text: "WhatsApp" },
            style: { base: { fontSize: "{size.sm}", fontWeight: 500 } },
          },
        ],
      },
    ],
  },
};

export const previews = { empty: {}, typical: {}, stress: {} };
