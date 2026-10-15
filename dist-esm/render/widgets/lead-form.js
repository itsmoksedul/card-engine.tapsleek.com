import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { asArray, str } from './shared';
/**
 * LEAD_FORM — posts to /v1/public/cards/:slug/lead.
 *
 * Fields come from the widget's content, which is the single source of truth
 * the backend validates against on submit.
 */
export function LeadFormRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const fields = asArray(c.fields);
    return (_jsxs("div", { className: cls('root'), children: [str(c.title) && _jsx("h2", { className: cls('title'), children: str(c.title) }), str(c.description) && _jsx("p", { className: cls('description'), children: str(c.description) }), _jsxs("form", { className: cls('form'), "data-columns": d.columns ?? '1', onSubmit: (e) => {
                    e.preventDefault();
                    if (ctx.isEditing)
                        return;
                    const data = new FormData(e.currentTarget);
                    ctx.track({ type: 'LEAD_SUBMIT', answers: Object.fromEntries(data.entries()) });
                }, children: [fields.map((field, i) => {
                        const key = str(field.key) || `field_${i}`;
                        const type = str(field.type) || 'text';
                        return (_jsxs("div", { className: cls('field'), "data-type": type, children: [d.showLabels !== false && (_jsx("label", { className: cls('label'), htmlFor: `${key}_${i}`, children: str(field.label) || key })), type === 'textarea' ? (_jsx("textarea", { id: `${key}_${i}`, name: key, className: cls('input'), placeholder: str(field.placeholder), required: Boolean(field.required), rows: 3 })) : (_jsx("input", { id: `${key}_${i}`, name: key, type: type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text', className: cls('input'), placeholder: str(field.placeholder), required: Boolean(field.required) }))] }, key));
                    }), _jsx("button", { type: "submit", className: cls('submit'), children: str(c.submitLabel) || 'Send' })] })] }));
}
