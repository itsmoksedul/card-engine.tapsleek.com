import React from 'react';
import { asArray, EmptyState, type WidgetRenderProps } from './shared';

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export function VideoGalleryRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const videos = asArray<any>(c.videos);

  if (!videos.length) {
    return <EmptyState cls={cls} ctx={ctx} label="No videos in gallery" />;
  }

  const isGrid = d.layout === 'grid';
  const columns = Number(d.columns) || 2;
  const gridTemplateColumns = isGrid ? `repeat(${columns}, minmax(0, 1fr))` : '1fr';
  const aspectRatio = d.aspectRatio ?? '16/9';

  return (
    <div className={cls('root')}>
      {c.title && <h3 className={cls('title')}>{c.title}</h3>}
      
      <div className={cls('grid')} style={{ gridTemplateColumns }}>
        {videos.map((video, i) => {
          const ytId = getYoutubeId(video.url || '');
          // Use custom thumbnail, or fallback to YouTube high-res thumbnail
          const thumbUrl = video.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');

          return (
            <a
              key={i}
              className={cls('item')}
              href={video.url || '#'}
              target="_blank"
              rel="noreferrer"
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio }}>
                {thumbUrl ? (
                  <img src={thumbUrl} alt={video.caption || 'Video thumbnail'} className={cls('thumbnail')} style={{ height: '100%', position: 'absolute' }} />
                ) : (
                  <div className={cls('thumbnail')} style={{ height: '100%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>No thumbnail</span>
                  </div>
                )}
                <div className={cls('playIcon')} data-icon="Play">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              {video.caption && <span className={cls('caption')}>{video.caption}</span>}
            </a>
          );
        })}
      </div>
    </div>
  );
}
