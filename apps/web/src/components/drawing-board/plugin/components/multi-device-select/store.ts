import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { type DeviceGroupItemProps } from '@/services/http';

interface MultiDeviceSelectStore {
    /** Device group */
    deviceGroups: DeviceGroupItemProps[];
    /** update device group */
    updateDeviceGroups: (panels: DeviceGroupItemProps[]) => void;
}

/**
 * use multi device group data global data
 */
const useMultiDeviceSelectStore = create(
    immer<MultiDeviceSelectStore>(set => ({
        deviceGroups: [],
        updateDeviceGroups(panels) {
            set(() => ({ deviceGroups: panels }));
        },
    })),
);

export default useMultiDeviceSelectStore;
