import { createContext } from 'react';

import { type DeviceDetail, type EntityAPISchema } from '@/services/http';

export interface MapContextProps {
    /**
     * is preview mode
     */
    isPreview?: boolean;
    /**
     * Current devices all entities status
     */
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
    getDeviceStatusById?: (device?: DeviceDetail) => EntityStatusData | undefined;
    getNoOnlineDevicesCount?: () => number;
}

export const MapContext = createContext<MapContextProps | null>(null);
