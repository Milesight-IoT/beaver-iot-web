import { useState } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { deviceAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { type DeviceSelectData } from '@/components/drawing-board/plugin/components/multi-device-select/interface';
import { SearchDeviceProps } from '../interface';

export function useDeviceData(devices?: DeviceSelectData[]) {
    const [selectDevice, setSelectDevice] = useState<SearchDeviceProps | null>(null);

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

    return {
        loading,
        data,
        selectDevice,
        handleSelectDevice,
    };
}
