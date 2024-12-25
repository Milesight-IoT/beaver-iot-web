import { EntityAPISchema } from '@/services/http';
import { getRange } from '../helper';
import type { PluginProps } from '../types';

type EntityStatusResult = EntityAPISchema['getEntityStatus']['response'];
export const useReducer = () => {
    const getEnumData = (currentEntity: EntityOptionType, value: string) => {
        // 获取当前选中实体
        const { entityValueAttribute } = currentEntity?.rawData || {};
        const { enum: enumStruct, unit } = entityValueAttribute || {};

        // 枚举类型
        if (enumStruct) {
            const currentKey = Object.keys(enumStruct).find(enumKey => {
                return enumKey === value;
            });
            if (!currentKey) return;

            return {
                label: enumStruct[currentKey],
                value: currentKey,
            };
        }

        // 非枚举类型
        return {
            label: unit ? `${value ?? '- '}${unit}` : `${value ?? ''}`,
            value: currentEntity?.value,
        };
    };

    const run = (
        entityStatusList: (EntityStatusResult | void)[],
        viewProps: PluginProps,
    ): SingleAdapterResult<string | number | void> => {
        const { config } = viewProps;
        const { entity } = config || {};

        const entityList: EntityOptionType[] = Array.isArray(entity)
            ? entity
            : [entity].filter(Boolean);
        const [currentEntity] = entityList;
        const [currentEntityStatus] = entityStatusList || [];

        const { value, value_type: valueType } = currentEntityStatus || {};

        const { label: chartLabel, value: chartValue } =
            getEnumData(currentEntity, value?.toString()) || {};

        return {
            entity: currentEntity,
            label: chartLabel || '',
            value: chartValue,
            attrs: {
                value,
                valueType,
                range: getRange(currentEntity),
            },
        };
    };

    return {
        run,
    };
};
