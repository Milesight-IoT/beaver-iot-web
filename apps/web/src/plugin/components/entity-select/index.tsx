import React, { useCallback, useMemo } from 'react';
import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap } from '@/plugin/utils';

type SingleEntitySelectProps = EntitySelectProps<EntityOptionType, false, false>;
interface IProps extends SingleEntitySelectProps {
    entityValueTypes: SingleEntitySelectProps['entityValueType'];
    entityAccessMods: SingleEntitySelectProps['entityAccessMod'];
    entityExcludeChildren: SingleEntitySelectProps['excludeChildren'];
    customFilterEntity: keyof typeof filterEntityMap;
}
/**
 * Entity Select drop-down component (single option)
 */
export default React.memo((props: IProps) => {
    const {
        entityType,
        entityValueType,
        entityValueTypes,
        entityAccessMod,
        entityAccessMods,
        entityExcludeChildren,
        customFilterEntity,
        ...restProps
    } = props;

    const filterOption = useMemo(
        () =>
            Reflect.get(
                filterEntityMap,
                customFilterEntity,
            ) as SingleEntitySelectProps['filterOption'],
        [customFilterEntity],
    );
    const getOptionValue = useCallback<Required<SingleEntitySelectProps>['getOptionValue']>(
        option => option?.value,
        [],
    );
    return (
        <EntitySelect
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
