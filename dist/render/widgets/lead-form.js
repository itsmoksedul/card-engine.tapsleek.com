"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadFormRender = LeadFormRender;
const jsx_runtime_1 = require("react/jsx-runtime");
const shared_1 = require("./shared");
/**
 * LEAD_FORM — posts to /v1/public/cards/:slug/lead.
 *
 * Fields come from the widget's content, which is the single source of truth
 * the backend validates against on submit.
 */
function LeadFormRender({ content, design, cls, ctx }) {
    const c = (content ?? {});
    const d = (design ?? {});
    const fields = (0, shared_1.asArray)(c.fields);
    return ((0, jsx_runtime_1.jsxs)("div", { className: cls('root'), children: [(0, shared_1.str)(c.title) && (0, jsx_runtime_1.jsx)("h2", { className: cls('title'), children: (0, shared_1.str)(c.title) }), (0, shared_1.str)(c.description) && (0, jsx_runtime_1.jsx)("p", { className: cls('description'), children: (0, shared_1.str)(c.description) }), (0, jsx_runtime_1.jsxs)("form", { className: cls('form'), "data-columns": d.columns ?? '1', onSubmit: (e) => {
                    e.preventDefault();
                    if (ctx.isEditing)
                        return;
                    const data = new FormData(e.currentTarget);
                    ctx.track({ type: 'LEAD_SUBMIT', answers: Object.fromEntries(data.entries()) });
                }, children: [fields.map((field, i) => {
                        const key = (0, shared_1.str)(field.key) || `field_${i}`;
                        const type = (0, shared_1.str)(field.type) || 'text';
                        return ((0, jsx_runtime_1.jsxs)("div", { className: cls('field'), "data-type": type, children: [d.showLabels !== false && ((0, jsx_runtime_1.jsx)("label", { className: cls('label'), htmlFor: `${key}_${i}`, children: (0, shared_1.str)(field.label) || key })), type === 'textarea' ? ((0, jsx_runtime_1.jsx)("textarea", { id: `${key}_${i}`, name: key, className: cls('input'), placeholder: (0, shared_1.str)(field.placeholder), required: Boolean(field.required), rows: 3 })) : ((0, jsx_runtime_1.jsx)("input", { id: `${key}_${i}`, name: key, type: type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text', className: cls('input'), placeholder: (0, shared_1.str)(field.placeholder), required: Boolean(field.required) }))] }, key));
                    }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: cls('submit'), children: (0, shared_1.str)(c.submitLabel) || 'Send' })] })] }));
}
