"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
exports.meta = {
    type: 'BUSINESS_HOURS',
    label: 'Opening Hours',
    iconName: 'Clock',
    group: 'business',
    description: 'Weekly opening hours with an optional open/closed badge.',
    contentVersion: 1,
    parts: [
        { key: 'root', label: 'Container' },
        { key: 'title', label: 'Title' },
        { key: 'badge', label: 'Open / closed badge' },
        { key: 'list', label: 'List' },
        { key: 'row', label: 'Day row' },
        { key: 'day', label: 'Day name' },
        { key: 'time', label: 'Hours' },
        { key: 'note', label: 'Note' },
    ],
    designSchema: [
        { key: 'showBadge', type: 'boolean', label: 'Show open / closed badge' },
        { key: 'highlightToday', type: 'boolean', label: 'Highlight today' },
        {
            key: 'timeFormat', type: 'select', label: 'Time format',
            options: [
                { value: '12h', label: '12-hour' },
                { value: '24h', label: '24-hour' },
            ],
        },
    ],
    contentSchema: [
        { key: 'title', type: 'text', label: 'Title', max: 60 },
        { key: 'timezone', type: 'text', label: 'Timezone', max: 40, hint: 'e.g. Asia/Dhaka' },
        {
            key: 'days', type: 'repeater', label: 'Days', min: 7, max: 7, itemLabel: '{day}',
            fields: [
                {
                    key: 'day', type: 'select', label: 'Day',
                    options: DAYS.map((d) => ({ value: d, label: DAY_LABELS[d] })),
                },
                { key: 'closed', type: 'boolean', label: 'Closed' },
                { key: 'open', type: 'time', label: 'Opens', visibleIf: { key: 'closed', equals: false } },
                { key: 'close', type: 'time', label: 'Closes', visibleIf: { key: 'closed', equals: false } },
            ],
        },
        { key: 'note', type: 'text', label: 'Note', max: 120 },
    ],
    defaultDesign: { showBadge: true, highlightToday: true, timeFormat: '12h' },
    defaultContent: {
        title: 'Opening hours',
        timezone: 'Asia/Dhaka',
        days: DAYS.map((d) => ({
            day: d,
            closed: d === 'fri',
            open: d === 'fri' ? '' : '10:00',
            close: d === 'fri' ? '' : '18:00',
        })),
        note: '',
    },
};
exports.previews = {
    empty: { title: '', timezone: '', days: [], note: '' },
    typical: exports.meta.defaultContent,
    stress: { ...exports.meta.defaultContent, title: 'A'.repeat(60), note: 'N'.repeat(120) },
};
