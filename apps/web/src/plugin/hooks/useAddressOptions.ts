import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import axios from 'axios';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { awaitWrap, deviceAPI, getResponseData, isRequestSuccess } from '@/services/http';

/**
 * 实体选项数据获取 hooks
 */
export function useAddressOptions() {
    const [options, setOptions] = useState<AdressType[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: addrData, run: getAddrLists } = useRequest(
        async (keyword?: string) => {
            setLoading(true);
            const [error, resp] = await awaitWrap(
                axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: keyword,
                        format: 'json',
                    },
                }),
            );

            // console.log({ error, resp });
            if (error) {
                setLoading(false);
                return;
            }

            return objectToCamelCase(resp);
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [],
        },
    );

    /**
     * 根据实体数据转换为选项数据处理
     */
    useEffect(() => {
        const newOptions: AdressType[] = (addrData?.data || []).map((item: any) => {
            return {
                value: item.placeId,
                label: item.displayName,
                lon: item.lon,
                lat: item.lat,
            };
        });
        setOptions(newOptions);
        setLoading(false);
    }, [addrData]);

    return {
        loading,
        getAddrLists,
        options,
        setOptions,
    };
}
