import React, { useCallback, useMemo, useContext } from 'react';
import {
    EntitySelect,
    type EntitySelectProps,
    type EntitySelectOption,
    type EntityValueType,
} from '@/components';
import { filterEntityMap } from '@/components/drawing-board/plugin/utils';
import {
    DrawingBoardContext,
    type DrawingBoardContextProps,
} from '@/components/drawing-board/context';

type SingleEntitySelectProps = EntitySelectProps<EntityOptionType, false, false>;
export interface IProps extends SingleEntitySelectProps {
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

    const context = useContext(DrawingBoardContext);

    const filterOption = useMemo(
        () =>
            Reflect.get(filterEntityMap, customFilterEntity) as (
                options: EntitySelectOption<EntityValueType>[],
                context: DrawingBoardContextProps | null,
            ) => EntitySelectOption<EntityValueType>[],
        [customFilterEntity],
    );

    const getOptionValue = useCallback<Required<SingleEntitySelectProps>['getOptionValue']>(
        option => option?.value,
        [],
    );
    return (
        <EntitySelect
            fieldName="entityId"
            entityType={entityType}
            entityValueType={entityValueTypes || entityValueType}
            entityAccessMod={entityAccessMods || entityAccessMod}
            excludeChildren={entityExcludeChildren}
            filterOption={
                filterOption ? oldOptions => filterOption(oldOptions, context) : undefined
            }
            getOptionValue={getOptionValue}
            {...restProps}
        />
    );
});
