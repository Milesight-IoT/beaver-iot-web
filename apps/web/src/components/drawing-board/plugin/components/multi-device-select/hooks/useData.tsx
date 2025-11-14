import { useEffect, useMemo, useState, useRef } from 'react';
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
    const { locationRequired } = props || {};

    const [keyword, setKeyword] = useState('');
    const [selectedUpdating, setSelectedUpdating] = useState(false);
    /**
     * Initial update selected devices data
     */
    const isInitRef = useRef(false);

    const [selectedDevices, setSelectedDevices] =
        useControllableValue<Partial<DeviceDetail>[]>(props);
    const { selectedGroup, updateSelectedGroup } = useMultiDeviceSelectStore();
    const { loadingGroups, getDeviceGroups } = useDeviceGroup();
    const { loadingDevices, deviceList, pageCount, getDeviceList, setPageNum } =
        useDeviceData(keyword);

    const handleSearch = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e?.target?.value || '');
    });

    const contextVal = useMemo((): MultiDeviceSelectContextProps => {
        return {
            selectedDevices,
            setSelectedDevices,
            ...props,
        };
    }, [selectedDevices, setSelectedDevices, props]);

    /**
     * Update current selected devices data
     */
    const getNewestSelected = useMemoizedFn(async () => {
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
            const data = (result?.content || [])
                .filter(d => {
                    /**
                     * Filter out the devices that have no location if the location is required.
                     */
                    if (locationRequired && !d?.location) {
                        return false;
                    }

                    return true;
                })
                .map(d => pick(d, ['id', 'group_id']));

            if (!isInitRef.current) {
                isInitRef.current = true;
            }
            setSelectedDevices(data);
        } finally {
            setSelectedUpdating(false);
        }
    });

    const refreshDeviceList = useMemoizedFn(async () => {
        if (selectedGroup || keyword) {
            getDeviceList?.();
        } else {
            getDeviceGroups?.();
        }

        getNewestSelected?.();
    });

    /**
     * Initial data
     */
    useEffect(() => {
        refreshDeviceList?.();
    }, [refreshDeviceList]);

    useEffect(() => {
        if (isInitRef.current) {
            return;
        }

        getNewestSelected?.();
    }, [selectedDevices, getNewestSelected]);

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
        selectedUpdating,
        loadingGroups,
        refreshDeviceList,
        setPageNum,
        handleSearch,
        updateSelectedGroup,
        setKeyword,
    };
}
