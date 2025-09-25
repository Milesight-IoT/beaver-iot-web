import { type DeviceDetail } from '@/services/http';

export interface MultiDeviceSelectProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    error?: boolean;
    helperText?: string | null;
    value?: Partial<DeviceDetail>[];
    onChange?: (newVal: Partial<DeviceDetail>[]) => void;
}
