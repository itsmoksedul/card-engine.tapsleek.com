export const meta = {
    type: 'SPACER',
    label: 'Spacer',
    iconName: 'MoveVertical',
    group: 'utility',
    description: 'Vertical empty space between blocks.',
    contentVersion: 1,
    contentSchema: [],
    defaultDesign: { size: 'md' },
    defaultContent: {},
    defaultLayout: {
        id: 'root',
        kind: 'element',
        tag: 'spacer',
        style: {
            base: { height: '{space.6}' },
        },
    },
};
export const previews = {
    empty: {},
    typical: {},
    stress: {},
};
