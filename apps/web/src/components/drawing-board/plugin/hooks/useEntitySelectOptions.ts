import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { get } from 'lodash-es';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';

import { type EntitySelectOption } from '@/components';
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
 * Entity option data Get HOOKS
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

    const [options, setOptions] = useState<EntitySelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const { run: getEntityOptions, data: entityOptions } = useRequest(
        async (keyword?: string) => {
            /**
             * Initialized loading status
             */
            setOptions([]);
            setLoading(true);

            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword,
                    // @ts-ignore TODO: prop type is error, should be EntityType[]
                    entity_type: entityType,
                    entity_value_type: entityValueTypes,
                    entity_access_mod: entityAccessMods,
                    exclude_children: entityExcludeChildren,
                    page_number: 1,
                    /**
                     * No pagination in the default, the request is up to 999
                     * If there is no data you want, enter keywords and then filter further
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

    /** Initialization execution */
    useEffect(() => {
        getEntityOptions();
    }, [getEntityOptions]);

    /**
     * Convert to option data according to the physical data
     */
    useEffect(() => {
        let newOptions: EntitySelectOption[] = (entityOptions || []).map(e => {
            const entityValueAttribute = safeJsonParse(
                (e as any).entity_value_attribute,
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
         * Customized filtering physical data
         * If you need to be customized, add the filtering function to expand it down through the FilterEntityMap object
         * CustomFilterEntity is the function name
         */
        const filterEntityFunction = get(filterEntityMap, customFilterEntity || '');
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
