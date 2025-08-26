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

type MultipleEntitySelectProps = EntitySelectProps<EntityOptionType, true, false>;
export interface IProps extends MultipleEntitySelectProps {
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

    const context = useContext(DrawingBoardContext);

    const filterOption = useMemo(
        () =>
            Reflect.get(filterEntityMap, customFilterEntity) as (
                options: EntitySelectOption<EntityValueType>[],
                context: DrawingBoardContextProps | null,
            ) => EntitySelectOption<EntityValueType>[],
        [customFilterEntity],
    );

    const getOptionValue = useCallback<
        Required<EntitySelectProps<any, false, false>>['getOptionValue']
    >(option => option?.value, []);
    return (
        <EntitySelect
            fieldName="entityId"
            multiple
            maxCount={maxCount}
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
