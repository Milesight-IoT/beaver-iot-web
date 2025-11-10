import { useState, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

import { type DateRangePickerValueType } from '@/components';

export function useDeviceData() {
    const [keyword, setKeyword] = useState('');
    const [selectTime, setSelectTime] = useState<number>(1440 * 60 * 1000);
    const [modalVisible, setModalVisible] = useState(false);
    const [timeRange, setTimeRange] = useState<DateRangePickerValueType | null>(null);

    const alarmRef = useRef<HTMLDivElement>(null);
    const alarmContainerWidth = alarmRef.current?.getBoundingClientRect()?.width || 0;

    const handleCustomTimeRange = useMemoizedFn((time: DateRangePickerValueType) => {
        /**
         * Custom time range, set select time to -1
         */
        setSelectTime(-1);
        console.log('handleCustomTimeRange ? ', time);
    });

    const onSelectTime = useMemoizedFn((time: number) => {
        if (time !== -1 && timeRange) {
            setTimeRange(null);
        }
    });

    return {
        keyword,
        setKeyword,
        alarmRef,
        alarmContainerWidth,
        selectTime,
        setSelectTime,
        modalVisible,
        setModalVisible,
        timeRange,
        setTimeRange,
        /**
         * Custom time range
         */
        handleCustomTimeRange,
        onSelectTime,
    };
}
