import { useEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useControllableValue } from 'ahooks';

import { type DeviceDetail } from '@/services/http';
import { type MultiDeviceSelectContextProps } from '../context';
import { type MultiDeviceSelectProps } from '../interface';
import useMultiDeviceSelectStore from '../store';
import { useDeviceData } from './useDeviceData';

export function useData(props: MultiDeviceSelectProps) {
    const [keyword, setKeyword] = useState('');

    const [selectedDevices, setSelectedDevices] =
        useControllableValue<Partial<DeviceDetail>[]>(props);
    const { selectedGroup, updateSelectedGroup } = useMultiDeviceSelectStore();
    const { loadingDevices, deviceList, pageCount, getDeviceList, setPageNum } =
        useDeviceData(keyword);

    useEffect(() => {
        console.log('selectedDevices ? ', selectedDevices);
    }, [selectedDevices]);

    useEffect(() => {
        console.log('selectedGroup ? ', selectedGroup);
    }, [selectedGroup]);

    const handleSearch = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e?.target?.value || '');
    });

    const contextVal = useMemo((): MultiDeviceSelectContextProps => {
        return {
            selectedDevices,
            setSelectedDevices,
        };
    }, [selectedDevices, setSelectedDevices]);

    /**
     * Component destruction
     */
    useEffect(() => {
        return () => {
            updateSelectedGroup(undefined);
        };
    }, [updateSelectedGroup]);

    return {
        selectedDevices,
        contextVal,
        selectedGroup,
        deviceList,
        keyword,
        loadingDevices,
        pageCount,
        setPageNum,
        handleSearch,
        updateSelectedGroup,
    };
}
