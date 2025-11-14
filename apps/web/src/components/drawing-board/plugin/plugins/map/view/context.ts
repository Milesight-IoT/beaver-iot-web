import { createContext } from 'react';

import { type DeviceDetail, type EntityAPISchema, type DeviceStatus } from '@/services/http';
import { type ColorType } from '@/components/map/components/marker';

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
    setSelectDevice?: React.Dispatch<React.SetStateAction<DeviceDetail | null>>;
    getDeviceStatus?: (device?: DeviceDetail) => DeviceStatus | undefined;
    getNoOnlineDevicesCount?: () => number;
    /**
     * Get color type by device status
     */
    getColorType?: (device?: DeviceDetail) => ColorType | undefined;
    /**
     * Statistics alarm devices count
     */
    getAlarmDevicesCount?: () => number;
    /**
     * Get newest entities status
     */
    getNewestEntitiesStatus?: () => void;
}

export const MapContext = createContext<MapContextProps | null>(null);
