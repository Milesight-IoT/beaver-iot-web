import { type SxProps } from '@mui/material';
import { type DeviceDetail } from '@/services/http';

export interface MultiDeviceSelectProps {
    /**
     * Style of wrapper
     */
    sx?: SxProps;
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    error?: boolean;
    helperText?: string | null;
    value?: Partial<DeviceDetail>[];
    onChange?: (newVal: Partial<DeviceDetail>[]) => void;
}

export interface DeviceSelectData {
    id: ApiKey;
    group_id: ApiKey;
}
