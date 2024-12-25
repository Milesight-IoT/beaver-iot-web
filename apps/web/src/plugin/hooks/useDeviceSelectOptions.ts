import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { awaitWrap, deviceAPI, getResponseData, isRequestSuccess } from '@/services/http';

/**
 * 实体选项数据获取 hooks
 */
export function useDeviceSelectOptions() {
    const [options, setOptions] = useState<DeviceOptionType[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: deviceData, run: getDeviceLists } = useRequest(
        async (keyword?: string) => {
            setLoading(true);
            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    name: keyword,
                    page_size: 999,
                    page_number: 1,
                }),
            );
            const data = getResponseData(resp);

            // console.log({ error, resp });
            if (error || !data || !isRequestSuccess(resp)) {
                setLoading(false);
                return;
            }

            return objectToCamelCase(data);
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [],
        },
    );

    /** 初始化执行 */
    useEffect(() => {
        getDeviceLists();
    }, [getDeviceLists]);

    /**
     * 根据实体数据转换为选项数据处理
     */
    useEffect(() => {
        const newOptions: DeviceOptionType[] = (deviceData?.content || []).map(item => {
            return {
                label: item.name,
                value: item.id,
            };
        });
        setOptions(newOptions);
        setLoading(false);
    }, [deviceData]);

    return {
        loading,
        getDeviceLists,
        options,
        setOptions,
    };
}
