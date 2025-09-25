import { createContext } from 'react';

import { type ImportEntityProps, type EntityAPISchema } from '@/services/http';
import { type TableRowDataType } from './hooks';

export interface DeviceListContextProps {
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
    data?: TableRowDataType[];
    /**
     * Current devices all entities status
     */
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
    handleServiceClick?: (entity?: ImportEntityProps) => Promise<void>;
    handleDeviceDrawingBoard?: (deviceId?: ApiKey) => Promise<void>;
}

export const DeviceListContext = createContext<DeviceListContextProps | null>(null);
