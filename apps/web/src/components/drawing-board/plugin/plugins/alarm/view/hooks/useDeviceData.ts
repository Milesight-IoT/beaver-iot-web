import { useState, useRef, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

import { type DateRangePickerValueType } from '@/components';
import { type AlarmContextProps } from '../context';
import { type TableRowDataType } from './useColumns';

/**
 * Mock data function
 */
function generateApiKey(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRandomAddress(): string {
    const prefixes = ['北京市', '上海市', '广州市', '深圳市', '杭州市'];
    const suffixes = ['XX路123号', 'XX大厦', 'XX小区5栋', 'XX园区A座', 'XX广场'];
    return (
        prefixes[Math.floor(Math.random() * prefixes.length)] +
        suffixes[Math.floor(Math.random() * suffixes.length)]
    );
}

function generateAlarmContent(): string {
    const contents = [
        'Abnormal soil, temperature: 100°C, humidity: 100%, conductivity: 5000',
        'Abnormal soil, temperature: 20°C, humidity: 50%, conductivity: 500',
        'Abnormal soil, temperature: 25°C, humidity: 50%, conductivity: 500',
        'Abnormal soil, temperature: 100°C, humidity: 50%, conductivity: 500',
        'Abnormal soil, temperature: 30°C, humidity: 50%, conductivity: 500',
        'Abnormal soil, temperature: 50°C, humidity: 50%, conductivity: 500',
        'Abnormal soil, temperature: 60°C, humidity: 50%, conductivity: 500',
        'Abnormal soil, temperature: 70°C, humidity: 50%, conductivity: 500',
    ];
    return contents[Math.floor(Math.random() * contents.length)];
}

function generateDeviceName(): string {
    const models = [
        'Tracker',
        'Locator',
        'Beacon',
        'Guardian',
        'SentinelLongLongLongLongLongLongLongLongLongLongLongLong',
    ];
    const id = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `${models[Math.floor(Math.random() * models.length)]}-${id}`;
}

export function generateMockTableData(count: number): TableRowDataType[] {
    const data: TableRowDataType[] = [];

    for (let i = 0; i < count; i++) {
        // 随机生成时间（过去7天内）
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const alarmTime = now - Math.floor(Math.random() * sevenDays);

        // 随机坐标（以北京为中心的小范围）
        const baseLat = 39.9042;
        const baseLng = 116.4074;
        const latitude = baseLat + (Math.random() - 0.5) * 0.1; // ±0.05°
        const longitude = baseLng + (Math.random() - 0.5) * 0.1;

        const alarmStatus = Math.random() > 0.3; // 70% 为 true
        const includeAddress = Math.random() > 0.2; // 80% 包含地址

        data.push({
            id: generateApiKey(),
            alarmStatus,
            alarmTime,
            alarmContent: generateAlarmContent(),
            latitude,
            longitude,
            address: includeAddress ? generateRandomAddress() : undefined,
            deviceId: generateApiKey(),
            deviceName: generateDeviceName(),
        });
    }

    return data;
}

const mockData = generateMockTableData(28);

export function useDeviceData() {
    const [keyword, setKeyword] = useState('');
    const [selectTime, setSelectTime] = useState<number>(1440 * 60 * 1000);
    const [modalVisible, setModalVisible] = useState(false);
    const [timeRange, setTimeRange] = useState<DateRangePickerValueType | null>(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

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

    const contextVal = useMemo(
        (): AlarmContextProps => ({
            data: mockData,
            showMobileSearch,
            setShowMobileSearch,
        }),
        [showMobileSearch],
    );

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
        contextVal,
        data: mockData,
    };
}
