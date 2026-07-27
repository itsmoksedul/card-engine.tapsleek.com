/**
 * APPOINTMENT — embeds a real booking flow.
 *
 * The `references` spec is what keeps the renderer pure: the backend resolves
 * `profileId` → { slug, name, duration } before the payload leaves the API,
 * exactly as the old `appointmentProfileId` pre-resolution did, but declared
 * as data instead of hardcoded in PublicCardsService.
 */
import type { WidgetModule } from '../types/widget';

export const meta: WidgetModule['meta'] = {
  type: 'APPOINTMENT',
  label: 'Booking',
  iconName: 'CalendarCheck',
  group: 'business',
  tier: 'PRO',
  description: 'Let people book a slot from one of your appointment profiles.',
  contentVersion: 1,
  interactive: true,
  references: [{ path: 'profileId', entity: 'appointmentProfile', as: 'profile' }],
  parts: [
    { key: 'root', label: 'Container' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'meta', label: 'Duration row' },
    { key: 'button', label: 'Book button' },
  ],
  designSchema: [
    {
      key: 'mode', type: 'select', label: 'Mode',
      options: [
        { value: 'button', label: 'Button to booking page' },
        { value: 'inline', label: 'Inline booking widget' },
      ],
    },
    { key: 'showDuration', type: 'boolean', label: 'Show duration' },
  ],
  contentSchema: [
    { key: 'title', type: 'text', label: 'Title', max: 60 },
    { key: 'description', type: 'textarea', label: 'Description', max: 200 },
    { key: 'profileId', type: 'reference', label: 'Appointment profile', entity: 'appointmentProfile', required: true },
    { key: 'buttonLabel', type: 'text', label: 'Button text', max: 40 },
  ],
  defaultDesign: { mode: 'button', showDuration: true },
  defaultContent: { title: 'Book a meeting', description: '', profileId: null, buttonLabel: 'Choose a time' },
};

export const previews = {
  empty: { title: '', description: '', profileId: null, buttonLabel: '' },
  typical: meta.defaultContent,
  stress: { title: 'A'.repeat(60), description: 'D'.repeat(200), profileId: null, buttonLabel: 'B'.repeat(40) },
};
