import { displayName, subtitleOf, type WidgetRenderProps } from './shared';

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
    </div>
  );
}
