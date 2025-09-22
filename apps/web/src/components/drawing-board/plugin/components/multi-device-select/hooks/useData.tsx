import { useEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useControllableValue } from 'ahooks';
import { isEmpty, pick } from 'lodash-es';

import {
    type DeviceDetail,
    deviceAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import { type MultiDeviceSelectContextProps } from '../context';
import { type MultiDeviceSelectProps } from '../interface';
import useMultiDeviceSelectStore from '../store';
import { useDeviceData } from './useDeviceData';
import { useDeviceGroup } from './useDeviceGroup';

export function useData(props: MultiDeviceSelectProps) {
    const [keyword, setKeyword] = useState('');
    const [selectedUpdating, setSelectedUpdating] = useState(false);

    const [selectedDevices, setSelectedDevices] =
        useControllableValue<Partial<DeviceDetail>[]>(props);
    const { selectedGroup, updateSelectedGroup } = useMultiDeviceSelectStore();
    const { loadingGroups, getDeviceGroups } = useDeviceGroup();
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

    const refreshDeviceList = useMemoizedFn(async () => {
        if (selectedGroup || keyword) {
            getDeviceList?.();
        } else {
            getDeviceGroups?.();
        }

        try {
            setSelectedUpdating(true);

            const idList = selectedDevices?.map(item => item.id)?.filter(Boolean) as
                | ApiKey[]
                | undefined;
            if (!Array.isArray(idList) || isEmpty(idList)) {
                return;
            }

            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    id_list: idList,
                    page_number: 1,
                    page_size: 100,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);
            const data = (result?.content || []).map(d => pick(d, ['id', 'group_id']));

            setSelectedDevices(data);
        } finally {
            setSelectedUpdating(false);
        }
    });

    const refreshing = useMemo(() => {
        if (loadingGroups || loadingDevices) {
            return false;
        }

        return selectedUpdating;
    }, [loadingGroups, loadingDevices, selectedUpdating]);

    /**
     * Initial data
     */
    useEffect(() => {
        refreshDeviceList?.();
    }, [refreshDeviceList]);

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
        refreshing,
        loadingGroups,
        refreshDeviceList,
        setPageNum,
        handleSearch,
        updateSelectedGroup,
    };
}
