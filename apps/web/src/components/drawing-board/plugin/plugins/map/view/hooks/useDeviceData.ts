import { useMemo, useRef, useState } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { isEmpty, get } from 'lodash-es';

import {
    deviceAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    type DeviceDetail,
} from '@/services/http';
import { type DeviceSelectData } from '@/components/drawing-board/plugin/components';
import { type HoverSearchAutocompleteExpose } from '@/components/hover-search-autocomplete/interface';
import { type PluginFullscreenContextProps } from '@/components/drawing-board/components';

function randomFloatWithSixDecimals(isLatitude?: boolean) {
    const randomLat = (18 + Math.random() * (54 - 18)).toFixed(6); // 18 ~ 54
    const randomLng = (73 + Math.random() * (135 - 73)).toFixed(6); // 73 ~ 135

    if (isLatitude) {
        return parseFloat(randomLat);
    }

    return parseFloat(randomLng);
}

export function useDeviceData(
    pluginFullscreenCxt: PluginFullscreenContextProps | null,
    devices?: DeviceSelectData[],
) {
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileKeyword, setMobileKeyword] = useState('');

    const hoverSearchRef = useRef<HoverSearchAutocompleteExpose>(null);

    const selectDevice = useMemo((): DeviceDetail | null => {
        return get(pluginFullscreenCxt?.extraParams, 'selectDevice', null);
    }, [pluginFullscreenCxt?.extraParams]);

    const setSelectDevice = useMemoizedFn((newVal?: DeviceDetail | null) => {
        pluginFullscreenCxt?.setExtraParams({
            selectDevice: newVal || null,
        });
    });

    const { loading, data } = useRequest(
        async () => {
            if (!Array.isArray(devices) || isEmpty(devices)) {
                return;
            }

            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    id_list: devices.map(d => d.id),
                    page_size: 100,
                    page_number: 1,
                }),
            );

            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);

            return result?.content || [];
        },
        {
            refreshDeps: [devices],
            debounceWait: 300,
        },
    );

    const handleSelectDevice = useMemoizedFn((...args) => {
        setSelectDevice(args?.[1] || null);
    });

    const cancelSelectDevice = useMemoizedFn(() => {
        setSelectDevice(null);
        hoverSearchRef?.current?.toggleShowSearch(false);
        setMobileKeyword('');
    });

    /**
     * TODO: delete demo data
     */
    const demoMapData = useMemo((): DeviceDetail[] => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return [];
        }

        return data.map(d => {
            return {
                ...d,
                location: {
                    latitude: randomFloatWithSixDecimals(true),
                    longitude: randomFloatWithSixDecimals(),
                },
            };
        });
    }, [data]);

    return {
        loading,
        data,
        selectDevice,
        demoMapData,
        hoverSearchRef,
        showMobileSearch,
        mobileKeyword,
        setShowMobileSearch,
        handleSelectDevice,
        cancelSelectDevice,
        setSelectDevice,
        setMobileKeyword,
    };
}
