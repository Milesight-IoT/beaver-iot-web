import { createContext } from 'react';

import { type AlarmSearchCondition } from '@/services/http';
import { type DateRangePickerValueType } from '@/components';

export interface AlarmContextProps {
    showMobileSearch?: boolean;
    setShowMobileSearch?: React.Dispatch<React.SetStateAction<boolean>>;
    timeRange?: DateRangePickerValueType | null;
    setTimeRange?: (value: DateRangePickerValueType | null) => void;
    searchCondition?: AlarmSearchCondition | null;
    getDeviceAlarmData?: () => void;
}

export const AlarmContext = createContext<AlarmContextProps | null>(null);
