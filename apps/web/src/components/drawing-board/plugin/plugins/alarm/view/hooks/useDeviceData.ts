import { useState, useRef } from 'react';

export function useDeviceData() {
    const [keyword, setKeyword] = useState('');
    const [selectTime, setSelectTime] = useState<number>(1440 * 60 * 1000);

    const alarmRef = useRef<HTMLDivElement>(null);
    const alarmContainerWidth = alarmRef.current?.getBoundingClientRect()?.width || 0;

    return {
        keyword,
        setKeyword,
        alarmRef,
        alarmContainerWidth,
        selectTime,
        setSelectTime,
    };
}
