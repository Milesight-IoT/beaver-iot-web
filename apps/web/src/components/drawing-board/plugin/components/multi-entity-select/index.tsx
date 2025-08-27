import React, { useCallback, useContext } from 'react';

import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap, filterEntityOption } from '@/components/drawing-board/plugin/utils';
import { DrawingBoardContext } from '@/components/drawing-board/context';

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
            filterOption={filterEntityOption(customFilterEntity, context)}
            getOptionValue={getOptionValue}
            {...restProps}
        />
    );
});
