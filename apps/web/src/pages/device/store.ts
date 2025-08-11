import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { type DeviceGroupItemProps } from '@/services/http/device';

interface DeviceStore {
    /** Current selected group */
    activeGroup?: DeviceGroupItemProps;
    /** Update current selected group data */
    updateActiveGroup: (group?: DeviceGroupItemProps) => void;
    /** All device groups */
    deviceGroups: DeviceGroupItemProps[];
    /** Update device groups */
    updateDeviceGroups: (groups: DeviceGroupItemProps[]) => void;
}

/**
 * device global data
 */
const useDeviceStore = create(
    immer<DeviceStore>(set => ({
        deviceGroups: [],
        updateActiveGroup(group) {
            set(state => {
                state.activeGroup = group;
            });
        },
        updateDeviceGroups(groups) {
            set(state => {
                state.deviceGroups = groups;
            });
        },
    })),
);

export default useDeviceStore;
