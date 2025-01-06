import React, { useCallback, useMemo } from 'react';
import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap } from '@/plugin/utils';

type MultipleEntitySelectProps = EntitySelectProps<EntityOptionType, true, false>;
interface IProps extends MultipleEntitySelectProps {
    entityValueTypes: MultipleEntitySelectProps['entityValueType'];
    entityAccessMods: MultipleEntitySelectProps['entityAccessMod'];
    entityExcludeChildren: MultipleEntitySelectProps['excludeChildren'];
    customFilterEntity: keyof typeof filterEntityMap;
}
/**
 * Entity Select drop-down components (multiple selections)
 */
export default React.memo((props: IProps) => {
    const {
        entityType,
        entityValueType,
        entityValueTypes,
        entityAccessMod,
        entityAccessMods,
        entityExcludeChildren,
        maxCount = 5,
        customFilterEntity,
        ...restProps
    } = props;

    const filterOption = useMemo(
        () =>
            Reflect.get(
                filterEntityMap,
                customFilterEntity,
            ) as MultipleEntitySelectProps['filterOption'],
        [customFilterEntity],
    );

    const getOptionValue = useCallback<
        Required<EntitySelectProps<any, false, false>>['getOptionValue']
    >(option => option?.value, []);
    return (
        <EntitySelect
            multiple
            maxCount={maxCount}
            entityType={entityType}
            entityValueType={entityValueTypes || entityValueType}
            entityAccessMod={entityAccessMods || entityAccessMod}
            excludeChildren={entityExcludeChildren}
            filterOption={filterOption}
            getOptionValue={getOptionValue}
            {...restProps}
        />
    );
});
