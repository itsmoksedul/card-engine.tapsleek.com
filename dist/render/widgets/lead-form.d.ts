import React from 'react';
import { type WidgetRenderProps } from './shared';
/**
 * LEAD_FORM — posts to /v1/public/cards/:slug/lead.
 *
 * Fields come from the widget's content, which is the single source of truth
 * the backend validates against on submit.
 */
export declare function LeadFormRender({ content, design, cls, ctx }: WidgetRenderProps): React.JSX.Element;
