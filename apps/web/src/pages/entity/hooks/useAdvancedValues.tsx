import { useCallback, useMemo } from 'react';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { awaitWrap, deviceAPI, getResponseData, tagAPI } from '@/services/http';
import { ENTITY_DATA_VALUE_TYPE } from '@/constants';
import { FilterValueOptionsType } from '@/components';

/**
 * For advanced filtering of the values of related columns, the options function can be selected
 */
const useAdvancedValues = () => {
    const advancedValuesMapper = useMemo(
        (): Record<string, FilterValueOptionsType> => ({
            getEntityTags: async (keyword?: string) => {
                return objectToCamelCase(
                    getResponseData(
                        (
                            await awaitWrap(
                                tagAPI.getTagList({ keyword, page_size: 9999, page_number: 1 }),
                            )
                        )[1],
                    ) ?? [],
                ).content.map(tag => ({
                    label: tag.name,
                    value: tag.name,
                }));
            },
            getDeviceGroup: async (keyword?: string) => {
                return objectToCamelCase(
                    getResponseData(
                        (
                            await awaitWrap(
                                deviceAPI.getDeviceGroupList({
                                    name: keyword,
                                    page_size: 9999,
                                    page_number: 1,
                                }),
                            )
                        )[1],
                    ) ?? [],
                ).content.map(tag => ({
                    label: tag.name,
                    value: tag.name,
                }));
            },
            getEntityDataValues: async () => {
                return Object.keys(ENTITY_DATA_VALUE_TYPE).map(key => ({
                    label: key,
                    value: key,
                }));
            },
        }),
        [],
    );

    return {
        advancedValuesMapper,
    };
};

export default useAdvancedValues;
