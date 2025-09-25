import { createContext } from 'react';

import { type DeviceDetail } from '@/services/http';

export interface MultiDeviceSelectContextProps {
    selectedDevices: Partial<DeviceDetail>[];
    setSelectedDevices: (v: React.SetStateAction<Partial<DeviceDetail>[]>, ...args: any[]) => void;
}

export const MultiDeviceSelectContext = createContext<MultiDeviceSelectContextProps | null>(null);
