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

export function useDeviceData(props: {
    devices?: DeviceSelectData[];
    pluginFullScreen?: boolean;
    changeIsFullscreen: ((isFullscreen: boolean) => void) | undefined;
}) {
    const { devices, pluginFullScreen, changeIsFullscreen } = props || {};

    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileKeyword, setMobileKeyword] = useState('');
    const [selectDevice, setSelectDevice] = useState<DeviceDetail | null>(null);

    const hoverSearchRef = useRef<HoverSearchAutocompleteExpose>(null);
    const searchFromFullscreenRef = useRef(false);

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

    const displayMobileSearchInput = useMemoizedFn(() => {
        searchFromFullscreenRef.current = !!pluginFullScreen;

        if (!pluginFullScreen) {
            changeIsFullscreen?.(true);
        }

        setShowMobileSearch(true);
    });

    const hiddenMobileSearchInput = useMemoizedFn(() => {
        if (!searchFromFullscreenRef?.current) {
            changeIsFullscreen?.(false);
        }

        setShowMobileSearch(false);
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
        displayMobileSearchInput,
        hiddenMobileSearchInput,
    };
}
