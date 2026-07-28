import React from 'react';
import { EmptyState, type WidgetRenderProps } from './shared';

const HEIGHT_MAP: Record<string, string> = {
  sm: '200px',
  md: '300px',
  lg: '450px',
};

export function MapRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const address = (c.address || '').trim();

  if (!address) {
    return <EmptyState cls={cls} ctx={ctx} label="No address provided" />;
  }

  const height = HEIGHT_MAP[d.height as string] || '300px';
  const mapType = d.mapType === 'k' ? 'k' : 'm'; // k=satellite, m=roadmap

  // Embed URL for Google Maps (no API key required)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className={cls('root')}>
      {c.label && <div className={cls('label')}>{c.label}</div>}
      
      {d.showAddress !== false && (
        <div className={cls('address')}>{address}</div>
      )}

      <div className={cls('mapWrapper')} style={{ height }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={embedUrl}
          title={`Map to ${address}`}
        />
      </div>

      {d.showDirectionsBtn !== false && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className={cls('directionsBtn')}
        >
          <span className={cls('icon')} data-icon="Navigation" aria-hidden />
          Get Directions
        </a>
      )}
    </div>
  );
}
