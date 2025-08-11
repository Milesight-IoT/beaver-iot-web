export enum FixedGroupEnum {
    /** All device */
    ALL = 'ALL',
    /** Ungrouped device */
    UNGROUPED = 'UNGROUPED',
}

export const FIXED_GROUP = [
    {
        id: FixedGroupEnum.ALL,
        name: 'device.label.all_devices',
    },
    {
        id: FixedGroupEnum.UNGROUPED,
        name: 'device.label.ungrouped_devices',
    },
];
