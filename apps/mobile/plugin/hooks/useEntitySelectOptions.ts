import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import { filterEntityMap } from '../utils';

function safeJsonParse(str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

/**
 * 实体选项数据获取 hooks
 */
export function useEntitySelectOptions(
    props: Pick<
        EntitySelectCommonProps,
        | 'entityAccessMods'
        | 'entityType'
        | 'entityValueTypes'
        | 'entityExcludeChildren'
        | 'customFilterEntity'
    >,
) {
    const {
        entityType,
        entityValueTypes,
        entityAccessMods,
        entityExcludeChildren = false,
        customFilterEntity,
    } = props;

    const [options, setOptions] = useState<EntityOptionType[]>([]);
    const [loading, setLoading] = useState(false);

    const { run: getEntityOptions, data: entityOptions } = useRequest(
        async (keyword?: string) => {
            /**
             * 初始化加载状态
             */
            setOptions([]);
            setLoading(true);

            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword,
                    entity_type: entityType,
                    entity_value_type: entityValueTypes,
                    entity_access_mod: entityAccessMods,
                    exclude_children: entityExcludeChildren,
                    page_number: 1,
                    /**
                     * 默认不进行分页，请求最多为 999
                     * 如无想要的数据，输入关键字再进行进一步的过滤
                     */
                    page_size: 999,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                setLoading(false);
                return;
            }

            const data = getResponseData(resp)!;
            return data?.content || [];
        },
        {
            manual: true,
            refreshDeps: [entityType, entityValueTypes, entityAccessMods, entityExcludeChildren],
            debounceWait: 300,
        },
    );

    /** 初始化执行 */
    useEffect(() => {
        getEntityOptions();
    }, [getEntityOptions]);

    /**
     * 根据实体数据转换为选项数据处理
     */
    useEffect(() => {
        let newOptions: EntityOptionType[] = (entityOptions || []).map(e => {
            const entityValueAttribute = safeJsonParse(
                e.entity_value_attribute,
            ) as EntityValueAttributeType;

            return {
                label: e.entity_name,
                value: e.entity_id,
                valueType: e.entity_value_type,
                description: [e.device_name, e.integration_name].filter(Boolean).join(', '),
                rawData: {
                    ...objectToCamelCase(e),
                    entityValueAttribute,
                },
            };
        });

        /**
         * 自定义过滤实体数据
         * 若需自定义，通过 filterEntityMap 对象增加过滤函数往下扩展即可
         * customFilterEntity 既为函数名称
         */
        const filterEntityFunction = Reflect.get(filterEntityMap, customFilterEntity || '');
        if (filterEntityFunction) {
            newOptions = filterEntityFunction(newOptions);
        }

        setOptions(newOptions);
        setLoading(false);
    }, [entityOptions, entityValueTypes, customFilterEntity]);

    return {
        loading,
        getEntityOptions,
        options,
        setOptions,
    };
}
