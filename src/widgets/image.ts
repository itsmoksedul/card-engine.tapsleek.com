import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'IMAGE',
  label: 'Image',
  iconName: 'Image',
  group: 'media',
  description: 'A single image, optionally linked, with a caption.',
  contentVersion: 1,
  contentSchema: [
    { key: 'src', type: 'image', label: 'Image', ratio: '16/9' },
    { key: 'alt', type: 'text', label: 'Alt text', max: 120 },
    { key: 'caption', type: 'text', label: 'Caption', max: 120 },
    { key: 'link', type: 'url', label: 'Link' },
  ],
  defaultDesign: { ratio: '16/9', fit: 'cover', showCaption: false },
  defaultContent: { src: '', alt: '', caption: '', link: '' },
  defaultLayout: {
    id: 'root',
    kind: 'element',
    tag: 'image',
    bind: { source: 'self', path: 'src' },
    style: {
      base: {
        width: '100%',
        borderRadius: { all: '{radius.lg}' },
        objectFit: 'cover',
      },
    },
  },
};

export const previews = {
  empty: { src: '' },
  typical: { src: 'https://picsum.photos/seed/ts/800/450', alt: 'Preview', caption: 'A caption', link: '' },
  stress: { src: 'https://picsum.photos/seed/ts/800/450', alt: 'A'.repeat(120), caption: 'B'.repeat(120), link: '' },
};
