import { FilterState, ChangeEventInfo, FiltersRecordType } from '../interface';
import { type FilterConfigProps, useFilter } from './useFilter';

/**
 * table column header
 */
const useHeader = (props: FilterConfigProps) => {
    const { onFilterInfoChange, columns } = props;

    const triggerFilterInfoChange = (
        filters: Partial<ChangeEventInfo>,
        filterStates?: FilterState[],
    ) => {
        const changeFilterInfo = {
            ...changeEventInfo.filters,
            ...filters,
        } as FiltersRecordType;
        onFilterInfoChange?.(changeFilterInfo);
    };

    const [renderHeader, filters] = useFilter({
        onFilterInfoChange: triggerFilterInfoChange,
        columns,
    });

    /**
     * all filter info
     */
    const changeEventInfo: Partial<ChangeEventInfo> = {};
    changeEventInfo.filters = filters;

    return {
        renderHeader,
    };
};

export default useHeader;
