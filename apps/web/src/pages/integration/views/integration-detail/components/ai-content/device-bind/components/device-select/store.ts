import { create } from 'zustand';
import { debounce } from 'lodash-es';
import {
    camthinkApi,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type CamthinkAPISchema,
} from '@/services/http';

interface UseDeviceSelectStore {
    /** Is init data ready */
    isDataReady?: boolean;

    /**
     * Global devices
     */
    devices?: CamthinkAPISchema['getDevices']['response']['content'] | null;

    /**
     * Get devices
     */
    getDevices: (
        params?: CamthinkAPISchema['getDevices']['request'],
    ) => Promise<UseDeviceSelectStore['devices']>;

    /**
     * Refresh devices
     */
    refreshDevices: (forced?: boolean) => void;
}

const useDeviceSelectStore = create<UseDeviceSelectStore>((set, get) => ({
    getDevices: async params => {
        const isSearch = !!params?.name;
        const [err, resp] = await awaitWrap(camthinkApi.getDevices(params));

        if (err || !isRequestSuccess(resp)) return null;
        const data = getResponseData(resp)?.content;

        if (!isSearch) {
            set({ isDataReady: true, devices: data });
        }
        return data;
    },

    refreshDevices: debounce<UseDeviceSelectStore['refreshDevices']>(async (forced = false) => {
        const { devices, getDevices } = get();

        if (!forced && devices?.length) return devices;
        await getDevices();
    }, 300),
}));

export default useDeviceSelectStore;
