import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'VIDEO_GALLERY',
  label: 'Video Gallery',
  iconName: 'Clapperboard',
  group: 'media',
  description: 'A grid or list of videos. Click to play.',
  contentVersion: 1,
  interactive: true,
  parts: [
    { key: 'root', label: 'Container', kind: 'container' },
    { key: 'title', label: 'Gallery Title', kind: 'text' },
    { key: 'grid', label: 'Grid Layout', kind: 'list' },
    { key: 'item', label: 'Video Item', kind: 'button' },
    { key: 'thumbnail', label: 'Thumbnail', kind: 'image' },
    { key: 'playIcon', label: 'Play Icon', kind: 'icon' },
    { key: 'caption', label: 'Caption', kind: 'text' },
  ],
  designSchema: [
    {
      key: 'layout', type: 'select', label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'Vertical List' },
      ],
    },
    {
      key: 'columns', type: 'select', label: 'Columns (Grid only)',
      visibleIf: { key: 'layout', equals: 'grid' },
      options: [
        { value: '2', label: '2 Columns' },
        { value: '3', label: '3 Columns' },
      ],
    },
    {
      key: 'aspectRatio', type: 'select', label: 'Thumbnail Aspect Ratio',
      options: [
        { value: '16/9', label: '16:9 Widescreen' },
        { value: '4/3', label: '4:3 Standard' },
        { value: '1/1', label: '1:1 Square' },
        { value: '9/16', label: '9:16 Vertical' },
      ],
    },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 100 },
    {
      key: 'videos', type: 'repeater', label: 'Videos', itemLabel: '{caption}',
      fields: [
        { key: 'url', type: 'url', label: 'Video URL' },
        { key: 'caption', type: 'text', label: 'Caption', max: 100 },
        { key: 'thumbnail', type: 'image', label: 'Custom Thumbnail (Optional)' },
      ]
    }
  ],
  defaultPartStyles: {
    root: { 
      base: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '{space.4}',
        padding: { all: '{space.4}' },
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' }
      } 
    },
    title: {
      base: {
        fontFamily: '{font.heading}',
        fontSize: '{size.lg}',
        fontWeight: 700,
        color: '{color.text}',
      }
    },
    grid: { 
      base: { 
        display: 'grid',
        gap: '{space.3}'
      } 
    },
    item: { 
      base: { 
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.2}',
        position: 'relative',
        cursor: 'pointer',
        transition: { property: ['transform'], duration: 150, easing: 'ease' }
      },
      hover: {
        transform: { translateY: '-2px' }
      }
    },
    thumbnail: {
      base: {
        width: '100%',
        objectFit: 'cover',
        borderRadius: { all: '{radius.md}' },
        background: { kind: 'color', color: '{color.border}' }
      }
    },
    playIcon: {
      base: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: { translateX: '-50%', translateY: '-50%' },
        width: '40px',
        height: '40px',
        color: '#ffffff',
        background: { kind: 'color', color: 'rgba(0,0,0,0.5)' },
        borderRadius: { all: '{radius.full}' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropBlur: '{blur.sm}'
      }
    },
    caption: { 
      base: { 
        fontSize: '{size.sm}', 
        color: '{color.text}', 
        fontWeight: 500
      } 
    },
  },
  defaultDesign: { layout: 'grid', columns: '2', aspectRatio: '16/9' },
  defaultContent: {
    title: 'Featured Videos',
    videos: [
      { url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Video 1', thumbnail: '' },
      { url: 'https://vimeo.com/123456', caption: 'Video 2', thumbnail: '' },
    ]
  }
};

export const previews = {
  empty: { title: '', videos: [] },
  typical: meta.defaultContent,
  stress: { title: 'A'.repeat(100), videos: Array(6).fill({ url: '#', caption: 'A'.repeat(100) }) }
};
