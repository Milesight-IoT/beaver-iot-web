import React, { useEffect, useState, useRef } from 'react';
import {
    Popover,
    Button,
    IconButton,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Box,
    Typography,
} from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';
import Tooltip from '../../../tooltip';
import { ColumnFilterItem, ColumnType, FilterKey, FilterState, SelectKeysType } from '../../types';

interface FilterDropdownProps {
    column: ColumnType;
    filterState?: FilterState;
    triggerFilter: (filterState: FilterState) => void;
}

/**
 * dropdown footer btn
 */
export const FilterDropdownFooter = ({
    children,
    resetDisabled,
    confirm,
    clearFilters,
}: {
    children: React.ReactNode;
    resetDisabled: boolean;
    confirm: () => void;
    clearFilters: () => void;
}) => {
    const { getIntlText } = useI18n();
    return (
        <div>
            {children}
            <div className="ms-table-pro-popover-footer">
                <div
                    className={classNames('ms-table-pro-popover-footer-reset', {
                        'ms-table-pro-popover-footer-reset-disable': resetDisabled,
                    })}
                >
                    <Button onClick={clearFilters} variant="outlined" disabled={resetDisabled}>
                        {getIntlText('common.button.reset')}
                    </Button>
                </div>
                <Button onClick={confirm} variant="contained">
                    {getIntlText('common.label.search')}
                </Button>
            </div>
        </div>
    );
};

/**
 * dropdown container component
 */
const FilterDropdown = (props: FilterDropdownProps) => {
    const { column, filterState, triggerFilter } = props;

    const { onFilterDropdownOpenChange } = column;

    const [visible, setVisible] = useState(false);
    const [openColumn, setOpenColumn] = useState<Element | null>(null);
    const filterIconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setOpenColumn(document.querySelector(`[data-field='${column.field}']`));
    }, [column]);

    /** is filtered */
    const filtered: boolean = !!(filterState?.filteredKeys || visible);

    const triggerVisible = (newVisible: boolean) => {
        setVisible(newVisible);
        onFilterDropdownOpenChange?.(newVisible);
    };

    /** select keys/value */
    const propFilteredKeys = filterState?.filteredKeys;

    const wrapStringListType = useMemoizedFn((keys?: FilterKey) => {
        return (keys as string[]) || [];
    });

    /** column search value */
    const [filteredKeys, setFilteredKeys] = useState(wrapStringListType(propFilteredKeys));

    /** search value change event */
    const onSelectKeys = ({ selectedKeys }: { selectedKeys: string[] }) => {
        setFilteredKeys(selectedKeys);
    };

    useEffect(() => {
        onSelectKeys({ selectedKeys: wrapStringListType(propFilteredKeys) });
    }, [propFilteredKeys]);

    /**
     * column searchValue change emit
     */
    const internalTriggerFilter = (keys?: string[]) => {
        const mergedKeys = keys?.length ? keys : null;
        triggerFilter({
            column,
            key: column.field,
            filteredKeys: mergedKeys,
        });
    };

    /**  confirm search */
    const onConfirm = () => {
        triggerVisible(false);
        internalTriggerFilter(filteredKeys);
    };

    // Popover close event
    const onClose = () => {
        triggerVisible(false);
        if (!isEqual(wrapStringListType(propFilteredKeys), filteredKeys)) {
            internalTriggerFilter(filteredKeys);
        }
    };

    /** click reset event */
    const onReset = () => {
        triggerVisible(false);
        setFilteredKeys([]);
        internalTriggerFilter([]);
    };

    /** render filters list */
    const renderFilterItems = ({
        filters,
        filteredKeys,
        handleCheckedChange,
    }: {
        filters: ColumnFilterItem[];
        filteredKeys: string[];
        handleCheckedChange: (filter: ColumnFilterItem) => void;
    }): React.ReactNode[] => {
        const renderItem = (item: ColumnFilterItem): React.ReactNode => {
            const key = String(item.value);
            if (item.children?.length) {
                return (
                    <Box
                        key={key}
                        component="div"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 1.5,
                            borderBottom: 1,
                            borderColor: 'var(--border-color-gray)',
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'var(--text-color-tertiary)',
                                fontSize: 'var(--font-size-2)',
                            }}
                        >
                            {item.text}
                        </Typography>
                        {item.children.map(child => renderItem(child))}
                    </Box>
                );
            }

            return (
                <FormControlLabel
                    key={key}
                    label={item.text}
                    control={
                        <Checkbox
                            disableRipple
                            checked={filteredKeys.includes(key)}
                            onChange={() => handleCheckedChange(item)}
                            inputProps={{ 'aria-label': 'controlled' }}
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 23 } }}
                        />
                    }
                />
            );
        };

        return filters.map(filter => renderItem(filter));
    };

    /**
     * filters list select change
     */
    const handleCheckBoxChange = useMemoizedFn((selectFilter: ColumnFilterItem) => {
        const newSelectKeys: string[] = [...filteredKeys];
        if (newSelectKeys.includes(String(selectFilter.value))) {
            newSelectKeys.splice(
                newSelectKeys.findIndex(key => key === selectFilter.value),
                1,
            );
        } else {
            newSelectKeys.push(String(selectFilter.value));
        }
        onSelectKeys({ selectedKeys: newSelectKeys });
    });

    /** render dropdown container  */
    const renderDropdownContainer = () => {
        let dropdownContent: React.ReactNode;
        if (typeof column.filterDropdown === 'function') {
            dropdownContent = column.filterDropdown({
                setSelectedKeys: (selectedKeys: SelectKeysType[]) =>
                    onSelectKeys({ selectedKeys: selectedKeys as string[] }),
                selectedKeys: filteredKeys,
                confirm: onConfirm,
                clearFilters: onReset,
                visible,
            });
        } else if (column.filterDropdown) {
            dropdownContent = column.filterDropdown;
        } else {
            const getFilterComponent = () => {
                const items = renderFilterItems({
                    filters: column.filters || [],
                    filteredKeys,
                    handleCheckedChange: handleCheckBoxChange,
                });

                return <FormGroup>{items}</FormGroup>;
            };

            const getResetDisabled = () => {
                return filteredKeys.length === 0;
            };

            dropdownContent = (
                <FilterDropdownFooter
                    resetDisabled={getResetDisabled()}
                    confirm={onConfirm}
                    clearFilters={onReset}
                >
                    {getFilterComponent()}
                </FilterDropdownFooter>
            );
        }

        return (
            <div className="ms-table-pro-popover">
                <div className="ms-table-pro-popover-filter">{dropdownContent}</div>
            </div>
        );
    };

    /** get column filter icon */
    const getFilterIcon = () => {
        let filterIcon: React.ReactNode;
        const { filterIcon: customIcon } = column;
        if (typeof customIcon === 'function') {
            filterIcon = customIcon(filtered);
        } else if (customIcon) {
            filterIcon = customIcon;
        } else {
            filterIcon = <SearchIcon />;
        }

        return (
            <div
                ref={filterIconRef}
                className={classNames('ms-table-pro-columns-header-icon', {
                    'ms-table-pro-columns-header-icon-active': filtered,
                })}
            >
                {filterIcon}
            </div>
        );
    };

    return (
        <div className="ms-table-pro-columns-header">
            <Tooltip autoEllipsis title={column.headerName}>
                <div className="ms-table-pro-columns-header-label">{column.headerName}</div>
            </Tooltip>
            <div
                onClick={() => {
                    triggerVisible(true);
                }}
            >
                {getFilterIcon()}
            </div>
            <Popover
                open={visible}
                anchorEl={filterIconRef.current}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {renderDropdownContainer()}
            </Popover>
        </div>
    );
};

export default FilterDropdown;
