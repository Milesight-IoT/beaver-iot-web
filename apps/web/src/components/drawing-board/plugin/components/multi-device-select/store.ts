import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { type DeviceGroupItemProps } from '@/services/http';

interface MultiDeviceSelectStore {
    /** Device group */
    deviceGroups: DeviceGroupItemProps[];
    /** update device group */
    updateDeviceGroups: (groups: DeviceGroupItemProps[]) => void;
    /** Selected Group */
    selectedGroup?: DeviceGroupItemProps;
    /** update Selected Group */
    updateSelectedGroup: (group?: DeviceGroupItemProps) => void;
}

/**
 * use multi device group data global data
 */
const useMultiDeviceSelectStore = create(
    immer<MultiDeviceSelectStore>(set => ({
        deviceGroups: [],
        updateDeviceGroups(groups) {
            set(() => ({ deviceGroups: groups }));
        },
        updateSelectedGroup(group) {
            set(() => ({ selectedGroup: group }));
        },
    })),
);

export default useMultiDeviceSelectStore;
