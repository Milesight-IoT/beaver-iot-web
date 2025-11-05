import { createContext } from 'react';

import { type DeviceDetail, type EntityAPISchema } from '@/services/http';

export interface MapContextProps {
    deviceData?: DeviceDetail[];
    /**
     * is preview mode
     */
    isPreview?: boolean;
    /**
     * Current devices all entities status
     */
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
    /**
     * Selected device
     */
    selectDevice?: DeviceDetail | null;
    /**
     * Set selected device
     */
    setSelectDevice?: (newVal?: DeviceDetail | null) => void;
    getDeviceStatusById?: (device?: DeviceDetail) => EntityStatusData | undefined;
    getNoOnlineDevicesCount?: () => number;
}

export const MapContext = createContext<MapContextProps | null>(null);
