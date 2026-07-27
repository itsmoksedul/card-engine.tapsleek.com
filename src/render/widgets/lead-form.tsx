import React from 'react';
import { asArray, str, type WidgetRenderProps } from './shared';

/**
 * LEAD_FORM — posts to /v1/public/cards/:slug/lead.
 *
 * Fields come from the widget's content, which is the single source of truth
 * the backend validates against on submit.
 */
export function LeadFormRender({ content, design, cls, ctx }: WidgetRenderProps) {
  const c = (content ?? {}) as Record<string, unknown>;
  const d = (design ?? {}) as Record<string, any>;
  const fields = asArray<Record<string, unknown>>(c.fields);

  return (
    <div className={cls('root')}>
      {str(c.title) && <h2 className={cls('title')}>{str(c.title)}</h2>}
      {str(c.description) && <p className={cls('description')}>{str(c.description)}</p>}

      <form
        className={cls('form')}
        data-columns={d.columns ?? '1'}
        onSubmit={(e) => {
          e.preventDefault();
          if (ctx.isEditing) return;
          const data = new FormData(e.currentTarget);
          ctx.track({ type: 'LEAD_SUBMIT', answers: Object.fromEntries(data.entries()) });
        }}
      >
        {fields.map((field, i) => {
          const key = str(field.key) || `field_${i}`;
          const type = str(field.type) || 'text';
          return (
            <div key={key} className={cls('field')} data-type={type}>
              {d.showLabels !== false && (
                <label className={cls('label')} htmlFor={`${key}_${i}`}>
                  {str(field.label) || key}
                </label>
              )}
              {type === 'textarea' ? (
                <textarea
                  id={`${key}_${i}`}
                  name={key}
                  className={cls('input')}
                  placeholder={str(field.placeholder)}
                  required={Boolean(field.required)}
                  rows={3}
                />
              ) : (
                <input
                  id={`${key}_${i}`}
                  name={key}
                  type={type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text'}
                  className={cls('input')}
                  placeholder={str(field.placeholder)}
                  required={Boolean(field.required)}
                />
              )}
            </div>
          );
        })}
        <button type="submit" className={cls('submit')}>
          {str(c.submitLabel) || 'Send'}
        </button>
      </form>
    </div>
  );
}
