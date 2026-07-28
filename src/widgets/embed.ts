import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'EMBED',
  label: 'Embed',
  iconName: 'Code',
  group: 'media',
  description: 'Embed external content like Spotify, Calendly, or Typeform via iframe HTML.',
  contentVersion: 1,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'wrapper', label: 'Embed Wrapper', kind: 'container' },
    { key: 'caption', label: 'Caption', kind: 'text' },
  ],
  designSchema: [
    {
      key: 'height', type: 'select', label: 'Height',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small (150px)' },
        { value: 'medium', label: 'Medium (300px)' },
        { value: 'large', label: 'Large (600px)' },
        { value: 'full', label: 'Full Screen (100vh)' },
      ],
    },
    { key: 'removePadding', type: 'boolean', label: 'Remove container padding' },
  ],
  contentSchema: [
    { 
      key: 'html', 
      type: 'text', 
      label: 'Embed Code', 
      hint: 'Paste the <iframe> code from Spotify, Calendly, Google Maps, etc.' 
    },
    { key: 'caption', type: 'text', label: 'Caption', max: 120 },
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
    wrapper: { 
      base: { 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: { all: '{radius.md}' },
        display: 'flex',
        flexDirection: 'column',
      } 
    },
    caption: { 
      base: { 
        fontSize: '{size.sm}', 
        color: '{color.muted}', 
        textAlign: 'center' 
      } 
    },
  },
  defaultDesign: { height: 'auto', removePadding: false },
  defaultContent: {
    html: '',
    caption: '',
  }
};

export const previews = {
  empty: { html: '', caption: '' },
  typical: { html: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>', caption: '' },
  stress: { html: 'A'.repeat(500), caption: 'A'.repeat(120) }
};
