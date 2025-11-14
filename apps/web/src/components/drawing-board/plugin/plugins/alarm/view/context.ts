import { createContext } from 'react';

import { type AlarmSearchCondition } from '@/services/http';
import { type DateRangePickerValueType } from '@/components';
import { DeviceSelectData } from '../../../components';

export interface AlarmContextProps {
    isPreview?: boolean;
    devices?: DeviceSelectData[];
    showMobileSearch?: boolean;
    setShowMobileSearch?: React.Dispatch<React.SetStateAction<boolean>>;
    timeRange?: DateRangePickerValueType | null;
    setTimeRange?: (value: DateRangePickerValueType | null) => void;
    /**
     * Used to get device alarm data search condition
     */
    searchConditionRef: React.MutableRefObject<AlarmSearchCondition | null>;
    /**
     * Select time, -1 means custom time range
     */
    selectTime?: number;
    /**
     * Set pagination model
     */
    setPaginationModel?: React.Dispatch<
        React.SetStateAction<{
            page: number;
            pageSize: number;
        }>
    >;
}

export const AlarmContext = createContext<AlarmContextProps | null>(null);
