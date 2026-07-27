"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'LEAD_FORM',
    label: 'Contact Form',
    iconName: 'Mail',
    group: 'contact',
    description: 'Collect names, emails and messages straight into Contacts.',
    contentVersion: 1,
    interactive: true,
    parts: [
        { key: 'root', label: 'Container' },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'form', label: 'Form' },
        { key: 'field', label: 'Field wrapper' },
        { key: 'label', label: 'Field label' },
        { key: 'input', label: 'Input' },
        { key: 'submit', label: 'Submit button' },
        { key: 'success', label: 'Success message' },
    ],
    designSchema: [
        {
            key: 'columns', type: 'select', label: 'Field layout',
            options: [
                { value: '1', label: 'One per row' },
                { value: '2', label: 'Two per row' },
            ],
        },
        { key: 'showLabels', type: 'boolean', label: 'Show field labels' },
    ],
    contentSchema: [
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        { key: 'description', type: 'textarea', label: 'Description', max: 200 },
        {
            key: 'fields', type: 'repeater', label: 'Fields', min: 1, max: 12, itemLabel: '{label}',
            fields: [
                { key: 'key', type: 'text', label: 'Key', required: true, max: 32, pattern: '^[a-zA-Z][a-zA-Z0-9_]*$' },
                { key: 'label', type: 'text', label: 'Label', required: true, max: 40 },
                {
                    key: 'type', type: 'select', label: 'Type',
                    options: [
                        { value: 'text', label: 'Text' },
                        { value: 'email', label: 'Email' },
                        { value: 'tel', label: 'Phone' },
                        { value: 'textarea', label: 'Long text' },
                        { value: 'select', label: 'Dropdown' },
                    ],
                },
                { key: 'placeholder', type: 'text', label: 'Placeholder', max: 60 },
                { key: 'required', type: 'boolean', label: 'Required' },
            ],
        },
        { key: 'submitLabel', type: 'text', label: 'Submit button text', max: 32 },
        { key: 'successMessage', type: 'text', label: 'Success message', max: 160 },
    ],
    defaultDesign: { columns: '1', showLabels: true },
    defaultContent: {
        title: 'Get in touch',
        description: '',
        fields: [
            { key: 'name', label: 'Full name', type: 'text', placeholder: '', required: true },
            { key: 'email', label: 'Email', type: 'email', placeholder: '', required: true },
            { key: 'message', label: 'Message', type: 'textarea', placeholder: '', required: false },
        ],
        submitLabel: 'Send',
        successMessage: 'Thanks — we will be in touch shortly.',
    },
};
exports.previews = {
    empty: { title: '', description: '', fields: [], submitLabel: '', successMessage: '' },
    typical: exports.meta.defaultContent,
    stress: {
        ...exports.meta.defaultContent,
        fields: Array.from({ length: 12 }, (_, i) => ({
            key: `field_${i}`, label: 'L'.repeat(40), type: 'text', placeholder: 'P'.repeat(60), required: false,
        })),
    },
};
