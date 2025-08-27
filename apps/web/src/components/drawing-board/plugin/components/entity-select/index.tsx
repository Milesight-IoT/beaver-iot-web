import React, { useCallback, useContext } from 'react';

import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap, filterEntityOption } from '@/components/drawing-board/plugin/utils';
import { DrawingBoardContext } from '@/components/drawing-board/context';

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
            filterOption={filterEntityOption(customFilterEntity, context)}
            getOptionValue={getOptionValue}
            {...restProps}
        />
    );
});
