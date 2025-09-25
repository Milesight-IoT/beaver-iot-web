import React, { useCallback, useContext } from 'react';

import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap, filterEntityOption } from '@/components/drawing-board/plugin/utils';
import { DrawingBoardContext } from '@/components/drawing-board/context';

type MultipleEntitySelectProps = EntitySelectProps<EntityOptionType, true, false>;
export interface IProps extends MultipleEntitySelectProps {
    customFilterEntity?: keyof typeof filterEntityMap;
}
/**
 * Entity Select drop-down components (multiple selections)
 */
export default React.memo((props: IProps) => {
    const { entityType, maxCount = 5, customFilterEntity, ...restProps } = props;

    const context = useContext(DrawingBoardContext);

    const getOptionValue = useCallback<
        Required<EntitySelectProps<any, false, false>>['getOptionValue']
    >(option => option?.value, []);
    return (
        <EntitySelect
            sx={{
                marginBottom: 2,
            }}
            fieldName="entityId"
            multiple
            maxCount={maxCount}
            entityType={entityType}
            filterOption={filterEntityOption(customFilterEntity, context)}
            getOptionValue={getOptionValue}
            {...restProps}
        />
    );
});
