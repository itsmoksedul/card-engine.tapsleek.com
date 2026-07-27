import React from 'react';
import { type WidgetRenderProps } from './shared';
/**
 * APPOINTMENT — links into the real booking flow.
 *
 * The profile is resolved by the backend before the payload leaves the API
 * (WidgetMeta.references), so this stays pure and synchronous.
 */
export declare function AppointmentRender({ content, design, cls, ctx }: WidgetRenderProps): React.JSX.Element;
