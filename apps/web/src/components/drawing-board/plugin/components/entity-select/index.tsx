import React, { useCallback, useContext } from 'react';

import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap, filterEntityOption } from '@/components/drawing-board/plugin/utils';
import { DrawingBoardContext } from '@/components/drawing-board/context';

type SingleEntitySelectProps = EntitySelectProps<EntityOptionType, false, false>;
export interface IProps extends SingleEntitySelectProps {
    customFilterEntity?: keyof typeof filterEntityMap;
}

/**
 * Entity Select drop-down component (single option)
 */
export default React.memo((props: IProps) => {
    const { entityType, customFilterEntity, ...restProps } = props;

    const context = useContext(DrawingBoardContext);

    const getOptionValue = useCallback<Required<SingleEntitySelectProps>['getOptionValue']>(
        option => option?.value,
        [],
    );
    return (
        <EntitySelect
            sx={{
                marginBottom: 2,
            }}
            fieldName="entityId"
            entityType={entityType}
            filterOption={filterEntityOption(customFilterEntity, context)}
            getOptionValue={getOptionValue}
            {...restProps}
        />
    );
});
