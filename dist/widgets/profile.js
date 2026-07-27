"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previews = exports.meta = void 0;
exports.meta = {
    type: 'PROFILE',
    label: 'Profile',
    iconName: 'User',
    group: 'identity',
    description: 'Avatar, name, title and bio pulled from General Info.',
    contentVersion: 1,
    derived: true,
    parts: [
        { key: 'root', label: 'Container' },
        { key: 'cover', label: 'Cover photo' },
        { key: 'avatar', label: 'Avatar' },
        { key: 'logo', label: 'Company logo' },
        { key: 'name', label: 'Name' },
        { key: 'subtitle', label: 'Job title / company' },
        { key: 'bio', label: 'Bio' },
        { key: 'location', label: 'Location' },
        { key: 'actions', label: 'Action row' },
        { key: 'action', label: 'Action button' },
    ],
    designSchema: [
        { key: 'showCover', type: 'boolean', label: 'Show cover photo' },
        { key: 'showAvatar', type: 'boolean', label: 'Show avatar' },
        { key: 'showLogo', type: 'boolean', label: 'Show company logo' },
        { key: 'showBio', type: 'boolean', label: 'Show bio' },
        { key: 'showLocation', type: 'boolean', label: 'Show location' },
        {
            key: 'align', type: 'select', label: 'Alignment',
            options: [
                { value: 'center', label: 'Centered' },
                { value: 'left', label: 'Left' },
            ],
        },
        {
            key: 'actions', type: 'select', label: 'Action buttons', multiple: true,
            options: [
                { value: 'vcard', label: 'Save contact' },
                { value: 'share', label: 'Share' },
                { value: 'qr', label: 'QR code' },
            ],
        },
    ],
    contentSchema: [],
    defaultDesign: {
        showCover: true,
        showAvatar: true,
        showLogo: true,
        showBio: true,
        showLocation: false,
        align: 'center',
        actions: ['vcard'],
    },
    defaultContent: {},
};
exports.previews = {
    empty: {},
    typical: {},
    stress: {},
};
