import { DEMO_PREVIEW_ASSETS } from '../../content/sample-preview';
import { displayName, subtitleOf, type WidgetRenderProps } from './shared';

export function ProfileRender({ design, cls, ctx }: WidgetRenderProps) {
  const card = ctx.card ?? {};
  const d = (design ?? {}) as Record<string, any>;
  const showPlaceholders = Boolean(card.showPlaceholders);

  const name = displayName(card);
  const subtitle = subtitleOf(card);
  const cover = card.coverPhoto || (showPlaceholders ? DEMO_PREVIEW_ASSETS.cover : undefined);
  const avatar = card.profileImage || (showPlaceholders ? DEMO_PREVIEW_ASSETS.avatar : undefined);
  const logo = card.companyLogo || (showPlaceholders ? DEMO_PREVIEW_ASSETS.logo : undefined);
  const location = card.location || (showPlaceholders ? 'Location' : undefined);
  const bio = card.bio || (showPlaceholders ? 'Bio description goes here...' : undefined);

  return (
    <div className={cls('root')} data-align={d.align ?? 'center'}>
      {d.showCover !== false && cover && (
        <img className={cls('cover')} src={cover} alt="" loading="lazy" />
      )}

      {d.showAvatar !== false && avatar && (
        <img className={cls('avatar')} src={avatar} alt={name || 'Avatar'} loading="lazy" />
      )}

      {d.showLogo !== false && logo && (
        <img className={cls('logo')} src={logo} alt={card.companyName ?? ''} loading="lazy" />
      )}

      {name && <div className={cls('name')}>{name}</div>}
      {subtitle && <div className={cls('subtitle')}>{subtitle}</div>}
      {d.showLocation !== false && location && (
        <div className={cls('location')}>{location}</div>
      )}
      {d.showBio !== false && bio && <p className={cls('bio')}>{bio}</p>}
    </div>
  );
}
