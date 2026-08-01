import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'MAP',
  label: 'Map',
  iconName: 'MapPin',
  group: 'business',
  description: 'Embed a Google Map based on an address.',
  contentVersion: 1,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'label', label: 'Label', kind: 'text' },
    { key: 'address', label: 'Address Text', kind: 'text' },
    { key: 'mapWrapper', label: 'Map Wrapper', kind: 'container' },
    { key: 'directionsBtn', label: 'Directions Button', kind: 'button' },
  ],
  designSchema: [
    {
      key: 'height', type: 'select', label: 'Map Height',
      options: [
        { value: 'sm', label: 'Small (200px)' },
        { value: 'md', label: 'Medium (300px)' },
        { value: 'lg', label: 'Large (450px)' },
      ],
    },
    {
      key: 'mapType', type: 'select', label: 'Map Type',
      options: [
        { value: 'm', label: 'Roadmap' },
        { value: 'k', label: 'Satellite' },
      ],
    },
    { key: 'showAddress', type: 'boolean', label: 'Show text address above map' },
    { key: 'showDirectionsBtn', type: 'boolean', label: 'Show "Get Directions" button' },
  ],
  contentSchema: [
    { key: 'label', type: 'text', label: 'Label', max: 60 },
    { key: 'address', type: 'text', label: 'Address to Display' },
  ],
  defaultPartStyles: {
    root: { 
      base: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '{space.3}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' }
      } 
    },
    label: {
      base: {
        fontSize: '{size.sm}',
        fontWeight: 600,
        color: '{color.primary}',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    },
    address: {
      base: {
        fontSize: '{size.base}',
        color: '{color.text}',
        fontWeight: 500
      }
    },
    mapWrapper: {
      base: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: { all: '{radius.md}' },
        background: { kind: 'color', color: '{color.border}' }
      }
    },
    directionsBtn: {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '{space.2}',
        padding: { t: '{space.3}', r: '{space.4}', b: '{space.3}', l: '{space.4}' },
        background: { kind: 'color', color: '{color.primary}' },
        color: '{color.surface}',
        borderRadius: { all: '{radius.full}' },
        fontWeight: 600,
        margin: { t: '{space.2}' },
        transition: { property: ['background-color', 'transform'], duration: 150, easing: 'ease' }
      },
      hover: { transform: { translateY: '-1px' } }
    }
  },
  defaultDesign: { height: 'md', mapType: 'm', showAddress: true, showDirectionsBtn: true },
  defaultContent: {
    label: 'Location',
    address: 'Times Square, New York, NY',
  }
};

export const previews = {
  empty: { label: '', address: '' },
  typical: meta.defaultContent,
  stress: { label: 'A'.repeat(60), address: '123 Very Long Address String That Keeps Going St, Suite 400, Floor 99, Some City, Some State 12345' }
};
