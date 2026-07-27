import React from 'react';

// Shell components for all 11 widgets to prove the concept. 
// In the future, these should be moved to individual files in `src/widgets/{type}/Render.tsx`

const Placeholder = ({ type, cls }: any) => (
  <div className={cls('root')}>
    <span>Placeholder for: {type}</span>
  </div>
);

export const WIDGET_RENDERERS = {
  PROFILE: (props: any) => <Placeholder type="PROFILE" {...props} />,
  CONTACT_LINKS: (props: any) => <Placeholder type="CONTACT_LINKS" {...props} />,
  RICH_TEXT: (props: any) => <Placeholder type="RICH_TEXT" {...props} />,
  SERVICE_LIST: (props: any) => <Placeholder type="SERVICE_LIST" {...props} />,
  GALLERY: (props: any) => <Placeholder type="GALLERY" {...props} />,
  FAQ: (props: any) => <Placeholder type="FAQ" {...props} />,
  TESTIMONIALS: (props: any) => <Placeholder type="TESTIMONIALS" {...props} />,
  BUSINESS_HOURS: (props: any) => <Placeholder type="BUSINESS_HOURS" {...props} />,
  APPOINTMENT: (props: any) => <Placeholder type="APPOINTMENT" {...props} />,
  LEAD_FORM: (props: any) => <Placeholder type="LEAD_FORM" {...props} />,
  CTA_BUTTON: (props: any) => <Placeholder type="CTA_BUTTON" {...props} />,
};
