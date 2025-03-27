import { useCallback, useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { DEFAULT_DEVICE_LABEL_KEY } from '../constant';
import type {
    EntitySelectComponentProps,
    EntitySelectOption,
    EntitySelectValueType,
    EntityValueType,
    TabType,
} from '../types';

interface IProps<
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> extends Pick<
        EntitySelectComponentProps<Value, Multiple, DisableClearable>,
        'fieldName' | 'filterOption'
    > {
    tabType: TabType;
    entityList: EntityData[];
    sourceList: EntityData[];
}
export const useOptions = <
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
>({
    tabType,
    entityList,
    sourceList,
    fieldName,
    filterOption,
}: IProps<Value, Multiple, DisableClearable>) => {
    const { getIntlText } = useI18n();

    /** Get description text */
    const getDescription = useCallback(
        (entity: ObjectToCamelCase<EntityData>, extraName?: string) => {
            const { entityType, entityParentName } = entity;

            const comma = getIntlText('common.symbol.comma');
            // Join entity type, entity key, and device name with commas
            return [entityType, extraName, entityParentName].filter(Boolean).join(`${comma} `);
        },
        [getIntlText],
    );

    /** Get value of the option based on entity data */
    const getOptionValue = useCallback(
        (entityData: ObjectToCamelCase<EntityData>) => {
            const { deviceName, entityKey, entityName, entityValueType, integrationName } =
                entityData || {};

            // Create an entity item for the select option
            const entityItem: EntitySelectOption<EntityValueType> = {
                value: fieldName ? entityData[fieldName] : entityKey,
                label: entityName,
                valueType: entityValueType,
                description: getDescription(entityData, deviceName || integrationName),
                rawData: entityData as unknown as EntitySelectOption<EntityValueType>['rawData'],
            };
            return entityItem;
        },
        [fieldName, getDescription],
    );

    const sourceOptionsList = useMemo(() => {
        const result = (sourceList || []).map(entity => {
            // Convert entity data to camel case
            const entityData = objectToCamelCase(entity || {});

            return getOptionValue(entityData);
        });
        return filterOption ? filterOption(result) : result;
    }, [sourceList, filterOption, getOptionValue]);

    const optionList = useMemo(() => {
        const result = (entityList || []).map(entity => {
            // Convert entity data to camel case
            const entityData = objectToCamelCase(entity || {});

            // ATTENTION: keep the entity enum value origin case
            if (entityData.entityValueAttribute?.enum) {
                entityData.entityValueAttribute.enum = entity.entity_value_attribute.enum;
            }

            return getOptionValue(entityData);
        });
        return filterOption ? filterOption(result) : result;
    }, [entityList, filterOption, getOptionValue]);

    /** Get entity drop-down options and device drop-down options */
    const { entityOptions, deviceOptions } = useMemo(() => {
        const { entityOptions, deviceMap } = (optionList || []).reduce<{
            deviceMap: Map<string, EntitySelectOption<EntityValueType>>;
            entityOptions: EntitySelectOption<EntityValueType>[];
        }>(
            (prev, entity) => {
                const { entityOptions, deviceMap } = prev;
                let newDeviceMap = deviceMap;

                const { rawData } = entity || {};
                const { deviceName } = rawData! || {};
                entityOptions.push(entity);
                const name = deviceName || getIntlText(DEFAULT_DEVICE_LABEL_KEY);

                // Create or update device group
                let deviceGroup = newDeviceMap.get(name);
                if (!deviceGroup) {
                    deviceGroup = {
                        value: name,
                        label: name,
                        children: [],
                    };
                }
                deviceGroup.children?.push({
                    ...entity,
                    description: getDescription(
                        rawData as unknown as ObjectToCamelCase<EntityData>,
                    ),
                });

                if (!deviceName) {
                    // Create a new Map and insert the entity without the device name first
                    newDeviceMap = new Map([[name, deviceGroup], ...newDeviceMap]);
                } else {
                    newDeviceMap.set(name, deviceGroup);
                }

                return {
                    deviceMap: newDeviceMap,
                    entityOptions,
                };
            },
            {
                deviceMap: new Map<string, EntitySelectOption<EntityValueType>>(),
                entityOptions: [],
            },
        );

        return {
            entityOptions,
            deviceOptions: Array.from(deviceMap.values()),
        };
    }, [optionList, getIntlText, getDescription]);

    /** Get the corresponding drop-down rendering options based on `tabType` */
    const options = useMemo(
        () => (tabType === 'entity' ? entityOptions : deviceOptions),
        [deviceOptions, entityOptions, tabType],
    );

    const entityOptionMap = useMemo(() => {
        return (sourceOptionsList || []).reduce((acc, option) => {
            const { value } = option;

            acc.set(value, option);
            return acc;
        }, new Map<EntityValueType, EntitySelectOption<EntityValueType>>());
    }, [sourceOptionsList]);

    return {
        options,
        entityOptionMap,
    };
};
