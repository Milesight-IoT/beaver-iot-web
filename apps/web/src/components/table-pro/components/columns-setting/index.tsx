import React, { useEffect, useState, useCallback, useRef } from 'react';
import { debounce, groupBy, isNumber, keyBy, reject, xorBy } from 'lodash-es';
import update from 'immutability-helper';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Checkbox, IconButton, List, ListItem, Popover, Tooltip } from '@mui/material';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { GridColumnResizeParams, GridValidRowModel } from '@mui/x-data-grid';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { iotLocalStorage } from '@milesight/shared/src/utils/storage';
import { ColumnSettingIcon, DragIndicatorIcon } from '@milesight/shared/src/components';
import { DragCard, DragContainer } from '@/components/drag';
import { ColumnType, ColumnSettingProps } from '../../types';
import { isOperationColumn } from '../../utils';

import './style.less';

/** Column display/fixed type */
interface CacheDisplayType {
    /** Column field */
    field: ColumnType['field'];
    /** Is fixed */
    fixed?: ColumnType['fixed'];
    /** Is it visible */
    checked?: boolean;
}

/** Column width cache type */
interface CacheWidthType {
    /** Column field */
    field: ColumnType['field'];
    width?: number;
    flex?: number;
}

/**
 * Drag the block data type
 */
type SettingItemType<T extends GridValidRowModel> = {
    fixed?: 'left' | 'right';

    /** Sub columns children, group by fixed */
    children: ColumnSettingProps<T>[];
};

interface IProps<T extends GridValidRowModel> {
    /**
     * Table instance api
     */
    apiRef: React.MutableRefObject<GridApiCommunity>;
    /**
     * ColumnType<T>
     */
    columns: ColumnSettingProps<T>[];
    /**
     * Unique columns display storage key
     */
    columnsDisplayCacheKey: string;
    /**
     * Unique columns width storage key
     */
    columnsWidthCacheKey: string;
    /**
     * Whether to default to a show operation column in setting
     */
    settingShowOpeColumn?: boolean;
    /**
     * Columns change eg: resize, fixed change
     */
    onChange?: (columns: ColumnSettingProps<T>[]) => void;
    /**
     * Customize filter functions that are not displayed in the settings panel and table
     */
    filterSettingColumns?: (settingColumns: ColumnSettingProps<T>[]) => ColumnSettingProps<T>[];
}

// Render custom column content
const ColumnCardItem = <T extends GridValidRowModel>({
    column,
    onChange,
}: {
    column: ColumnSettingProps<T>;
    onChange: (event: React.ChangeEvent, column: ColumnSettingProps<T>) => void;
}) => {
    return (
        <ListItem>
            <div className="ms-column-setting-list-area-item">
                <span>
                    <DragIndicatorIcon
                        sx={{
                            height: 16,
                            width: 16,
                        }}
                    />
                </span>
                <Checkbox
                    defaultChecked={!!column?.checked}
                    onChange={event => onChange(event, column)}
                    sx={{
                        height: 16,
                        width: 16,
                        mr: 1,
                        ml: 1,
                    }}
                />
                {column.headerName}
            </div>
        </ListItem>
    );
};

/**
 * Customize the display|hide|fixed|width change of the columns in the table
 */
const ColumnsSetting = <T extends GridValidRowModel>({
    apiRef,
    columns,
    columnsDisplayCacheKey,
    columnsWidthCacheKey,
    settingShowOpeColumn,
    onChange: onColumnsChange,
    filterSettingColumns,
}: IProps<T>) => {
    const { getIntlText } = useI18n();

    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'columnsSettingPopover',
    });

    const columnsListRef = useRef<SettingItemType<T>[]>([]);
    const [columnsList, setColumnsList] = useState<SettingItemType<T>[]>([]);

    // Filter the selection columns and create new columns, and whether storage is needed
    const updateColumns = (columnsList: SettingItemType<T>[], isStorage = true) => {
        setColumnsList(columnsList);
        const newArr = columnsList.map(i => i.children).flat();
        const resultColumns = (filterSettingColumns ? filterSettingColumns(newArr) : newArr).filter(
            item => item?.checked,
        );

        // storage
        if (isStorage && !!columnsDisplayCacheKey) {
            iotLocalStorage.setItem(
                columnsDisplayCacheKey,
                newArr.map((column: ColumnSettingProps<T>) => {
                    return {
                        field: column.field,
                        fixed: column?.fixed,
                        checked: column?.checked,
                    };
                }),
            );
        }

        if (isStorage && !!columnsWidthCacheKey) {
            iotLocalStorage.setItem(
                columnsWidthCacheKey,
                newArr.map((column: ColumnSettingProps<T>) => {
                    return {
                        field: column.field,
                        width: column?.width,
                        // flex will affect the width. If it is 0, the modified width will be maintained
                        flex: column?.flex,
                    };
                }),
            );
        }
        onColumnsChange && onColumnsChange(resultColumns);
    };

    // Column checked change
    const onChange = ({ target }: { target: any }, item: ColumnSettingProps<T>) => {
        const { checked } = target;
        item.checked = !!checked;
        updateColumns([...columnsList]);
    };

    // Column width change
    const debounceColumnWidthChange = useRef(
        debounce((column: GridColumnResizeParams) => {
            const resizeColumn = reject(columnsListRef.current, 'fixed')[0]?.children.find(
                (col: ColumnSettingProps<T>) => col.field === column.colDef.field,
            );
            if (resizeColumn) {
                resizeColumn.width = parseFloat(column.width.toFixed(1));
                resizeColumn.flex = column.colDef.flex;
                updateColumns([...columnsListRef.current]);
            }
        }, 300),
    );

    useEffect(() => {
        columnsListRef.current = columnsList;
    }, [columnsList]);

    // ColumnResize change event
    useEffect(() => {
        apiRef.current?.subscribeEvent('columnResize', (column: GridColumnResizeParams) => {
            debounceColumnWidthChange.current(column);
        });
        return () => {
            debounceColumnWidthChange.current.cancel();
        };
    }, [apiRef.current]);

    // Group by fixed
    const transformColumns = (columns: ColumnSettingProps<T>[]): SettingItemType<T>[] => {
        const groupColumn = groupBy(columns, ({ fixed }) => fixed ?? '');
        return (['left', '', 'right'] as const).map(fixed => ({
            fixed: fixed === '' ? undefined : fixed,
            children: groupColumn[fixed] || [],
        }));
    };

    useEffect(() => {
        let columnsCopy = [...columns];
        const columnsDisplayStorage =
            (columnsDisplayCacheKey &&
                iotLocalStorage.getItem<CacheDisplayType[]>(columnsDisplayCacheKey)) ||
            [];
        const columnsWidthStorage =
            (columnsWidthCacheKey &&
                iotLocalStorage.getItem<CacheWidthType[]>(columnsWidthCacheKey)) ||
            [];

        // If the columns are different, the cache is unavailable
        const displayCacheUnable = xorBy(columnsCopy, columnsDisplayStorage, 'field').length > 0;
        const hasHiddenColumn = columnsCopy.some(col => col.hidden);

        // Cache is unavailable. use by default
        if (displayCacheUnable) {
            iotLocalStorage.removeItem(columnsDisplayCacheKey);
            iotLocalStorage.removeItem(columnsWidthCacheKey);

            columnsCopy = columnsCopy.map((item: ColumnSettingProps<T>) => {
                item.checked = !item.hidden;
                return item;
            });
        } else {
            const data: ColumnSettingProps<T>[] = [];
            const columnsCopyObj: Record<string, ColumnSettingProps<T>> = keyBy(
                columnsCopy,
                'field',
            );
            const columnsWidthObj: Record<string, CacheWidthType> = keyBy(
                columnsWidthStorage,
                'field',
            );

            columnsDisplayStorage.forEach(item => {
                const column = columnsCopyObj[item.field];
                if (column) {
                    column.checked = !!item?.checked;
                    column.fixed = item?.fixed;
                    column.width = columnsWidthObj[item.field]?.width || column.width;
                    column.flex = isNumber(columnsWidthObj[item.field]?.flex)
                        ? columnsWidthObj[item.field]?.flex
                        : 0;
                    data.push(column);
                }
            });
            columnsCopy = data;
        }

        columnsCopy.forEach(col => {
            if (col.fixed && !col.width) {
                col.width = col.minWidth;
            }
        });

        const sortData = transformColumns(columnsCopy);
        updateColumns(sortData, hasHiddenColumn);
    }, [columnsDisplayCacheKey, columnsWidthCacheKey, columns]);

    /**
     * Filter operation column, including operating columns, customizing columns not to display, etc
     */
    const filterColumns = (columns: ColumnSettingProps<T>[]) => {
        const resultColumns = settingShowOpeColumn
            ? columns
            : columns.filter(col => !isOperationColumn(col.field));
        return filterSettingColumns ? filterSettingColumns(resultColumns) : resultColumns;
    };

    // Drag event
    const moveCard = useCallback<
        (
            dragIndex: number,
            dragParentIndex: number,
            hoverIndex: number,
            hoverParentIndex: number,
        ) => void
    >((dragIndex, dragParentIndex, hoverIndex, hoverParentIndex) => {
        setColumnsList(prevColumnsList => {
            const dragItem = prevColumnsList[dragParentIndex].children[dragIndex];
            if (hoverParentIndex === 0) {
                dragItem.fixed = 'left';
            } else if (hoverParentIndex === 2) {
                dragItem.fixed = 'right';
            } else {
                dragItem.fixed = undefined;
            }
            const dragData = update(prevColumnsList, {
                [dragParentIndex]: {
                    children: { $splice: [[dragIndex, 1]] },
                },
            });
            const dropData = update(dragData, {
                [hoverParentIndex]: {
                    children: { $splice: [[hoverIndex, 0, dragItem]] },
                },
            });
            columnsListRef.current = dropData;
            return dropData;
        });
    }, []);

    const onDragEnd = () => {
        if (columnsListRef.current.length === 0) {
            return;
        }
        updateColumns(columnsListRef.current);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="ms-column-setting-btn">
                <Tooltip title={getIntlText('common.label.columns_setting')}>
                    <IconButton size="medium" {...bindTrigger(popupState)}>
                        <ColumnSettingIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div className="ms-column-setting">
                    <div className="ms-column-setting-header">
                        <h3>{getIntlText('common.label.columns_setting')}</h3>
                    </div>
                    <List className="ms-column-setting-list">
                        <DragContainer>
                            {columnsList.map((column, columnIndex) => (
                                // eslint-disable-next-line
                                <div key={columnIndex} className="ms-column-setting-list-item">
                                    <div className="ms-column-setting-list-title">
                                        {column?.fixed === 'right' &&
                                            getIntlText('common.label.column_setting_fixed_right')}
                                        {column?.fixed === 'left' &&
                                            getIntlText('common.label.column_setting_fixed_left')}
                                        {!column?.fixed &&
                                            getIntlText(
                                                'common.label.column_setting_non_fixed_column',
                                            )}
                                    </div>
                                    <DragContainer className="ms-column-setting-list-area">
                                        {filterColumns(column.children).map((col, index) => (
                                            <DragCard
                                                key={col.field}
                                                parentIndex={columnIndex}
                                                index={index}
                                                id={col?.field}
                                                moveCard={moveCard}
                                                onDragEnd={onDragEnd}
                                            >
                                                <ColumnCardItem
                                                    column={col}
                                                    onChange={(event, col) => onChange(event, col)}
                                                />
                                            </DragCard>
                                        ))}
                                        {filterColumns(column.children).length === 0 && (
                                            <DragCard
                                                parentIndex={columnIndex}
                                                index={0}
                                                canDrag
                                                moveCard={moveCard}
                                                onDragEnd={onDragEnd}
                                            >
                                                <div className="ms-column-setting-list-empty">
                                                    {getIntlText('common.label.empty')}
                                                </div>
                                            </DragCard>
                                        )}
                                    </DragContainer>
                                </div>
                            ))}
                        </DragContainer>
                    </List>
                </div>
            </Popover>
        </DndProvider>
    );
};

export default ColumnsSetting;
