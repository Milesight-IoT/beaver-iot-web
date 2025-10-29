import { createContext } from 'react';

import { type ImportEntityProps, type EntityAPISchema } from '@/services/http';
import { type TableRowDataType } from './hooks';

export interface DeviceListContextProps {
    keyword: string;
    setKeyword: (newVal: string) => void;
    data?: TableRowDataType[];
    /**
     * Current devices all entities status
     */
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
    loadingDeviceDrawingBoard?: Record<string, boolean>;
    handleServiceClick?: (entity?: ImportEntityProps) => Promise<void>;
    handleDeviceDrawingBoard?: (deviceId?: ApiKey) => Promise<void>;
}

export const DeviceListContext = createContext<DeviceListContextProps | null>(null);
