import { useCallback, useRef } from 'react';
import { OutlinedInput } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ColumnType, FilterDropdownProps } from '../../interface';
import { FilterDropdownFooter } from '../../components/filter-down/filterDown';

/**
 * table column filter props
 */
const useFilterProps = () => {
    const { getIntlText } = useI18n();
    const searchInput = useRef<HTMLInputElement>(null);
    const rangePicker = useRef<any>(null);

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
                        searchInput?.current?.select();
                        rangePicker?.current?.getRef()?.focus();
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
                                <div className="ms-table-pro-popover-filter-searchInput">
                                    <OutlinedInput
                                        inputRef={searchInput}
                                        placeholder={getIntlText('common.label.search')}
                                        value={selectedKeys?.[0]}
                                        onChange={e => {
                                            setSelectedKeys(e.target.value ? [e.target.value] : []);
                                        }}
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
