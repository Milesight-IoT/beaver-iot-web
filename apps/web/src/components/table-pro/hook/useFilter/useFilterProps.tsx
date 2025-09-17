import { useCallback, useRef } from 'react';
import { OutlinedInput } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import DateRangePicker, { type DateRangePickerValueType } from '@/components/date-range-picker';
import { ColumnType, FilterDropdownProps } from '../../types';
import { FilterDropdownFooter } from '../../components/filter-down/filterDown';

/**
 * table column filter props
 */
const useFilterProps = () => {
    const { getIntlText } = useI18n();
    const searchInput = useRef<HTMLInputElement>(null);

    /** assembly filterProps by filterSearchType */
    const getColumnFilterProps = useCallback(
        (type: ColumnType['filterSearchType']) => {
            if (!type) return {};

            /**
             * dropdown component visible event
             */
            const onFilterDropdownOpenChange: ColumnType['onFilterDropdownOpenChange'] = (
                visible: boolean,
            ) => {
                if (visible) {
                    setTimeout(() => {
                        searchInput?.current?.focus();
                    }, 50);
                }
            };

            /**
             * return filterDropdown props
             */
            const filterDropdown: ColumnType['filterDropdown'] = ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
                visible,
            }: FilterDropdownProps) => {
                /**
                 * generate search component
                 */
                const generateSearchComponent = (type: ColumnType['filterSearchType']) => {
                    switch (type) {
                        case 'search': {
                            return (
                                <div
                                    className="ms-table-pro-popover-filter-searchInput"
                                    onKeyDown={e => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <OutlinedInput
                                        inputRef={searchInput}
                                        placeholder={getIntlText('common.label.search')}
                                        value={selectedKeys?.[0]}
                                        onChange={e => {
                                            setSelectedKeys(e.target.value ? [e.target.value] : []);
                                        }}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                confirm();
                                            }
                                        }}
                                    />
                                </div>
                            );
                        }
                        case 'datePicker': {
                            return (
                                <div className="ms-table-pro-popover-filter-date-picker">
                                    <DateRangePicker
                                        label={{
                                            start: getIntlText('common.label.start_date'),
                                            end: getIntlText('common.label.end_date'),
                                        }}
                                        onChange={value => {
                                            setSelectedKeys(value ? [value] : []);
                                        }}
                                        value={selectedKeys?.[0] as DateRangePickerValueType}
                                        views={['year', 'month', 'day']}
                                    />
                                </div>
                            );
                        }
                        default: {
                            break;
                        }
                    }

                    return null;
                };

                return (
                    <FilterDropdownFooter
                        resetDisabled={!selectedKeys.length}
                        confirm={confirm}
                        clearFilters={clearFilters}
                    >
                        {generateSearchComponent(type)}
                    </FilterDropdownFooter>
                );
            };

            return {
                filterDropdown,
                onFilterDropdownOpenChange,
            };
        },
        [getIntlText],
    );

    return {
        getColumnFilterProps,
    };
};

export default useFilterProps;
