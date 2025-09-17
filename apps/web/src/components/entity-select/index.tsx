import React, { useMemo, useState } from 'react';
import { useControllableValue } from 'ahooks';
import EntitySelect from './entitySelect';
import { useOptions, useSourceData } from './hooks';
import type { EntitySelectProps, EntitySelectValueType, TabType } from './types';

const EntitySelectApp = <
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    Props extends EntitySelectProps<Value, Multiple, DisableClearable> = EntitySelectProps<
        Value,
        Multiple,
        DisableClearable
    >,
>(
    props: EntitySelectProps<Value, Multiple, DisableClearable>,
) => {
    const {
        multiple,
        maxCount: _maxCount,
        loading,
        entityType,
        entityValueType,
        entityAccessMod,
        excludeChildren,
        fieldName = 'entityKey',
        getOptionValue: _getOptionValue,
        filterOption,
    } = props;

    const maxCount = useMemo(() => (multiple ? _maxCount : void 0), [_maxCount, multiple]);
    const getOptionValue = useMemo(
        () => _getOptionValue || ((value: EntitySelectValueType) => value),
        [_getOptionValue],
    );

    const {
        entityList,
        sourceList,
        onSearch,
        loading: sourceLoading,
    } = useSourceData({
        entityType,
        entityValueType,
        entityAccessMod,
        excludeChildren,
    });
    const [value, onChange] = useControllableValue<Required<Props>['value']>(props);

    const [tabType, setTabType] = useState<TabType>('entity');
    const { options, entityOptionMap } = useOptions<Value, Multiple, DisableClearable>({
        tabType,
        entityList,
        sourceList,
        fieldName,
        filterOption,
    });

    return (
        <EntitySelect<Value, Multiple, DisableClearable>
            {...props}
            multiple={multiple}
            value={value}
            onChange={onChange}
            loading={loading || sourceLoading}
            onSearch={onSearch}
            maxCount={maxCount}
            getOptionValue={getOptionValue}
            tabType={tabType}
            setTabType={setTabType}
            options={options}
            entityOptionMap={entityOptionMap}
        />
    );
};
export default React.memo(EntitySelectApp) as unknown as typeof EntitySelectApp;

export { default as useEntityStore, type EntityStoreType } from './store';

export type {
    EntitySelectOption,
    EntitySelectValueType,
    EntitySelectProps,
    EntityValueType,
} from './types';
