import React from 'react';
import { displayName, subtitleOf, type WidgetRenderProps } from './shared';

/**
 * PROFILE — the card's identity header.
 *
 * Derived: it stores nothing of its own and reads General Info straight off the
 * card. Every field the `Card` model exposes is represented here, so an admin
 * can switch pieces on and off without needing a second widget:
 *
 *   coverPhoto   → cover      firstName+lastName → name
 *   profileImage → avatar     jobTitle+companyName → subtitle
 *   companyLogo  → logo       bio → bio        location → location
 *
 * `actions` wires the native card behaviours (Save contact / Share / QR),
 * which is what replaced the hardcoded "SAVE AS CONTACT" button in v1.
 */
export function ProfileRender({ design, cls, ctx }: WidgetRenderProps) {
  const card = ctx.card ?? {};
  const d = (design ?? {}) as Record<string, any>;

  const name = displayName(card);
  const subtitle = subtitleOf(card);
  const actions: string[] = Array.isArray(d.actions) ? d.actions : [];

  return (
    <div className={cls('root')} data-align={d.align ?? 'center'}>
      {d.showCover !== false && card.coverPhoto && (
        <img className={cls('cover')} src={card.coverPhoto} alt="" loading="lazy" />
      )}

      {d.showAvatar !== false && card.profileImage && (
        <img className={cls('avatar')} src={card.profileImage} alt={name} loading="lazy" />
      )}

      {d.showLogo !== false && card.companyLogo && (
        <img className={cls('logo')} src={card.companyLogo} alt={card.companyName ?? ''} loading="lazy" />
      )}

      {name && <div className={cls('name')}>{name}</div>}
      {subtitle && <div className={cls('subtitle')}>{subtitle}</div>}
      {d.showBio !== false && card.bio && <p className={cls('bio')}>{card.bio}</p>}
      {d.showLocation && card.location && <div className={cls('location')}>{card.location}</div>}

      {actions.length > 0 && (
        <div className={cls('actions')}>
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              className={cls('action')}
              data-action={action}
              onClick={() => ctx.track({ type: 'ACTION', action })}
            >
              {ACTION_LABELS[action] ?? action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  vcard: 'Save contact',
  share: 'Share',
  qr: 'QR code',
};
