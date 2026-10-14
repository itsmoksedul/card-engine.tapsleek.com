import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'VIDEO',
  label: 'Video',
  iconName: 'Video',
  group: 'media',
  description: 'Embed a single YouTube, Vimeo, or direct MP4 video.',
  contentVersion: 1,
  interactive: true,
  defaultLayout: {
    id: 'video-root',
    kind: 'element',
    tag: 'stack',
    style: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        gap: '{space.2}',
        background: { kind: 'color', color: '{color.surface}' },
        borderRadius: { all: '{radius.lg}' },
      },
    },
    children: [
      {
        id: 'player',
        kind: 'element',
        tag: 'video',
        bind: { source: 'self', path: 'url' },
        props: { controls: true },
        style: {
          base: {
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            borderRadius: { all: '{radius.md}' },
            background: { kind: 'color', color: '#000' },
            aspectRatio: '16/9',
          },
        },
        // Layers inside the player are its cover: shown until the visitor
        // taps it, then swapped for the real player. Delete them all to get
        // the plain embed back.
        children: [
          {
            id: 'thumb',
            kind: 'element',
            tag: 'image',
            name: 'Thumbnail',
            // Uploaded thumbnail, or YouTube's own when none is set.
            bind: { source: 'self', path: 'thumbnail' },
            hideIfEmpty: true,
            style: {
              base: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              },
            },
          },
          {
            id: 'playButton',
            kind: 'element',
            tag: 'frame',
            name: 'Play button',
            style: {
              base: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: { translateX: '-50%', translateY: '-50%' },
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: { all: '{radius.full}' },
                background: { kind: 'color', color: '{color.primary}' },
                boxShadow: '{shadow.md}',
              },
            },
            children: [
              {
                id: 'playIcon',
                kind: 'element',
                tag: 'icon',
                name: 'Play icon',
                props: { name: 'Play' },
                style: {
                  base: {
                    width: '26px',
                    height: '26px',
                    fontSize: '26px',
                    color: '#ffffff',
                    margin: { l: '3px' },
                  },
                },
              },
            ],
          },
        ],
      },
      {
        id: 'caption',
        kind: 'element',
        tag: 'text',
        hideIfEmpty: true,
        bind: { source: 'self', path: 'caption' },
        style: {
          base: {
            fontSize: '{size.sm}',
            color: '{color.muted}',
            textAlign: 'center',
          },
        },
      },
    ],
  },
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
    { key: 'thumbnail', type: 'image', label: 'Thumbnail Image', ratio: '16/9', hint: 'Shown until the video is played. Empty uses the YouTube thumbnail.' },
    { key: 'caption', type: 'text', label: 'Caption', max: 120 },
  ],
  defaultDesign: { aspectRatio: '16/9', controls: true, autoplay: false, loop: false },
  defaultContent: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: '',
    caption: '',
  }
};

export const previews = {
  empty: { url: '', thumbnail: '', caption: '' },
  typical: meta.defaultContent,
  stress: { url: meta.defaultContent.url, thumbnail: '', caption: 'A'.repeat(120) }
};
