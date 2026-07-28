import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'VIDEO',
  label: 'Video',
  iconName: 'Video',
  group: 'media',
  description: 'Embed a single YouTube, Vimeo, or direct MP4 video.',
  contentVersion: 1,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'player', label: 'Video Player', kind: 'container' },
    { key: 'caption', label: 'Caption', kind: 'text' },
  ],
  designSchema: [
    {
      key: 'aspectRatio', type: 'select', label: 'Aspect Ratio',
      options: [
        { value: '16/9', label: '16:9 Widescreen' },
        { value: '4/3', label: '4:3 Standard' },
        { value: '1/1', label: '1:1 Square' },
        { value: '9/16', label: '9:16 Vertical (Shorts)' },
      ],
    },
    { key: 'controls', type: 'boolean', label: 'Show Controls' },
    { key: 'autoplay', type: 'boolean', label: 'Autoplay (Muted)' },
    { key: 'loop', type: 'boolean', label: 'Loop' },
  ],
  contentSchema: [
    { key: 'url', type: 'url', label: 'Video URL', hint: 'YouTube, Vimeo, or direct MP4 link.' },
    { key: 'caption', type: 'text', label: 'Caption', max: 120 },
  ],
  defaultPartStyles: {
    root: { 
      base: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '{space.2}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' }
      } 
    },
    player: { 
      base: { 
        position: 'relative',
        width: '100%', 
        overflow: 'hidden', 
        borderRadius: { all: '{radius.md}' },
        background: { kind: 'color', color: '#000' }
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
  defaultDesign: { aspectRatio: '16/9', controls: true, autoplay: false, loop: false },
  defaultContent: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    caption: '',
  }
};

export const previews = {
  empty: { url: '', caption: '' },
  typical: meta.defaultContent,
  stress: { url: meta.defaultContent.url, caption: 'A'.repeat(120) }
};
