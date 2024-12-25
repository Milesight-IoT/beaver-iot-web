import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { awaitWrap, deviceAPI, getResponseData, isRequestSuccess } from '@/services/http';
// import { filterEntityMap } from '../utils';

/**
 * 实体选项数据获取 hooks
 */
export function useEntitySelectOptionsByDevice(
    props: Pick<
        EntitySelectCommonProps,
        'entityType' | 'entityValueTypes' | 'customFilterEntity' | 'deviceId'
    >,
) {
    const { entityType, entityValueTypes, customFilterEntity, deviceId } = props;

    const [options, setOptions] = useState<EntityOptionTypeForDevice[]>([]);
    const [defaultOpts, setDefaultOpts] = useState<EntityOptionTypeForDevice[]>([]);
    const [loading, setLoading] = useState(false);

    const [entityOptions, setEntityOptions] = useState<EntityOptionTypeForDevice[]>([]);

    const { run: getDeviceDetail } = useRequest(
        async () => {
            if (!deviceId) return;
            const [error, resp] = await awaitWrap(deviceAPI.getDetail({ id: deviceId }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;
            const data = objectToCamelCase(respData);
            setEntityOptions(data.entities as any);
            return data;
        },
        {
            debounceWait: 300,
            refreshDeps: [deviceId],
        },
    );

    /** 初始化执行 */
    useEffect(() => {
        getDeviceDetail();
    }, [getDeviceDetail]);

    /**
     * 根据实体数据转换为选项数据处理
     */
    useEffect(() => {
        let newOptions = (entityOptions || []).map((e: EntityOptionTypeForDevice) => {
            return {
                label: e.name,
                value: e.id,
                valueType: e.valueType,
                type: e.type,
            };
        });
        if (entityType) {
            newOptions = newOptions.filter(item => entityType?.includes(item.type));
        }

        /**
         * 自定义过滤实体数据
         * 若需自定义，通过 filterEntityMap 对象增加过滤函数往下扩展即可
         * customFilterEntity 既为函数名称
         */
        // const filterEntityFunction = Reflect.get(filterEntityMap, customFilterEntity || '');
        // if (filterEntityFunction) {
        //     newOptions = filterEntityFunction(newOptions);
        // }

        setOptions(newOptions);
        setDefaultOpts(newOptions);
        setLoading(false);
    }, [entityOptions, entityValueTypes, customFilterEntity]);

    const filterOptions = (keyword: string) => {
        let opts = defaultOpts;
        if (keyword) {
            opts = opts.filter(item => item.label && item.label.includes(keyword));
        }
        setOptions(opts);
    };

    return {
        loading,
        getDeviceDetail,
        options,
        setOptions,
        filterOptions,
    };
}
