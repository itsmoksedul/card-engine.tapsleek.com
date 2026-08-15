import { type WidgetRenderProps } from './shared';
/**
 * CONTACT_LINKS — renders the card's CardLink rows.
 *
 * Also derived. Links stay a first-class DB entity because they carry per-link
 * click analytics, so this widget only decides which ones appear and how they
 * look. `data-link-id` is what the click beacon reads.
 */
export declare function ContactLinksRender({ design, content, cls, ctx }: WidgetRenderProps): import("react").JSX.Element;
