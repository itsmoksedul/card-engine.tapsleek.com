import React from 'react';
import { RenderIcon } from './icon-helper';
import { type WidgetRenderProps } from './shared';

export function ConnectButtonsRender({ design, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;

  return (
    <div className={cls('root')}>
      {d.showSaveContact !== false && (
        <button
          type="button"
          className={cls('saveContact')}
          onClick={() => ctx.track({ type: 'VCARD_DOWNLOAD' })}
        >
          <RenderIcon name="UserPlus" />
          <span>Save Contact</span>
        </button>
      )}

      {d.showConnectNow !== false && (
        <button
          type="button"
          className={cls('connectNow')}
          onClick={() => ctx.track({ type: 'CONNECT_CLICK' })}
        >
          <RenderIcon name="Send" />
          <span>Connect Now</span>
        </button>
      )}
    </div>
  );
}
