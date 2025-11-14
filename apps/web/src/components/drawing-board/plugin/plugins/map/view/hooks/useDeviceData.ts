import { useRef, useState } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';

import {
    deviceAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    type DeviceDetail,
} from '@/services/http';
import { type DeviceSelectData } from '@/components/drawing-board/plugin/components';
import { type HoverSearchAutocompleteExpose } from '@/components/hover-search-autocomplete/interface';

// function randomFloatWithSixDecimals(isLatitude?: boolean) {
//     const randomLat = (18 + Math.random() * (54 - 18)).toFixed(6);
//     const randomLng = (73 + Math.random() * (135 - 73)).toFixed(6);

//     if (isLatitude) {
//         return parseFloat(randomLat);
//     }

//     return parseFloat(randomLng);
// }

export function useDeviceData(devices?: DeviceSelectData[]) {
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileKeyword, setMobileKeyword] = useState('');
    const [selectDevice, setSelectDevice] = useState<DeviceDetail | null>(null);

    const hoverSearchRef = useRef<HoverSearchAutocompleteExpose>(null);

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

            return (result?.content || []).filter(d => !!d?.location);
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

    return {
        loading,
        data,
        selectDevice,
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
