import { createContext } from 'react';

import { type DeviceDetail } from '@/services/http';
import type { MultiDeviceSelectProps } from './interface';

export interface MultiDeviceSelectContextProps extends MultiDeviceSelectProps {
    selectedDevices: Partial<DeviceDetail>[];
    setSelectedDevices: (v: React.SetStateAction<Partial<DeviceDetail>[]>, ...args: any[]) => void;
}

export const MultiDeviceSelectContext = createContext<MultiDeviceSelectContextProps | null>(null);
