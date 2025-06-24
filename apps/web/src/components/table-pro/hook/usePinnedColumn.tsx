import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { last, orderBy } from 'lodash-es';
import { DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { useTheme } from '@milesight/shared/src/hooks';
import { ColumnType } from '../interface';

export interface PinnedColumnType<T extends GridValidRowModel> {
    /**
     * Hook that instantiate a [[GridApiRef]].
     */
    apiRef: React.MutableRefObject<GridApiCommunity>;
    /**
     * columns of type [[GridColDef]][].
     */
    columns: ColumnType<T>[];
    /**
     * Partial DataGridProps
     *
     */
    restProps: Partial<DataGridProps>;
}

type PinnedColumn = ColumnType & {
    left: string;
    right: string;
    /** field class eg: ms-table-cell-pos-name */
    posClassName?: string;
};

const CHECKBOX_SIZE = 50;
const HEADER_FIXED_LEFT_CLASS = 'ms-table-header-fix-left';
const HEADER_FIXED_RIGHT_CLASS = 'ms-table-header-fix-right';
const CELL_FIXED_LEFT_CLASS = 'ms-table-cell-fix-left';
const CELL_FIXED_RIGHT_CLASS = 'ms-table-cell-fix-right';
const POS_PREFIX = 'ms-table-cell-pos-';

const ROW_CHECKBOX_CLASS = [
    '.MuiDataGrid-columnHeader.MuiDataGrid-columnHeaderCheckbox',
    '.MuiDataGrid-cellCheckbox.MuiDataGrid-cell',
];

/**
 * pinning column
 */
const usePinnedColumn = <T extends GridValidRowModel>(props: PinnedColumnType<T>) => {
    const { matchMobile } = useTheme();
    const { apiRef, columns, restProps } = props;
    const { checkboxSelection } = restProps;

    const [scrollYSize, setScrollYSize] = useState<number>(0);

    const getCellClassName = (
        column: PinnedColumn,
        pinnedLeftLast: ColumnType | undefined,
        pinnedRightFirst: ColumnType | undefined,
    ): PinnedColumn => {
        const headerClassNameList = [
            column.headerClassName as string,
            `${POS_PREFIX}${column.field}`,
            column.fixed === 'left' ? HEADER_FIXED_LEFT_CLASS : HEADER_FIXED_RIGHT_CLASS,
            pinnedLeftLast?.field === column.field ? `${CELL_FIXED_LEFT_CLASS}-last` : '',
            pinnedRightFirst?.field === column.field ? `${CELL_FIXED_RIGHT_CLASS}-first` : '',
        ].filter((v: string) => !!v);

        const cellClassNameList = [
            column.cellClassName as string,
            `${POS_PREFIX}${column.field}`,
            column.fixed === 'left' ? CELL_FIXED_LEFT_CLASS : CELL_FIXED_RIGHT_CLASS,
            pinnedLeftLast?.field === column.field ? `${CELL_FIXED_LEFT_CLASS}-last` : '',
            pinnedRightFirst?.field === column.field ? `${CELL_FIXED_RIGHT_CLASS}-first` : '',
        ].filter((v: string) => !!v);

        return {
            ...column,
            headerClassName: headerClassNameList.join(' '),
            cellClassName: cellClassNameList.join(' '),
            posClassName: `.${POS_PREFIX}${column.field}`,
        };
    };

    // Calculate the absolute positions of the columns that need to be fixed
    const pinnedColumnPos: Record<ColumnType['field'], PinnedColumn> = useMemo(() => {
        if (matchMobile) return {};
        const pinnedColumns = columns
            .filter(
                (column: ColumnType) =>
                    !!column.width || (column.minWidth && column.minWidth === column.maxWidth),
            )
            .reduce((groupAcc: any, column: ColumnType) => {
                const { fixed = '' } = column;
                if (!groupAcc[fixed]) {
                    groupAcc[fixed] = [];
                }
                if (column.minWidth && column.minWidth === column.maxWidth) {
                    column.width = column.minWidth;
                }
                groupAcc[fixed].push(column);
                return groupAcc;
            }, {});

        const pinnedLeftLast: ColumnType | undefined = (
            (pinnedColumns.left as ColumnType[]) || []
        ).at(-1);
        const pinnedRightFirst: ColumnType | undefined = ((pinnedColumns.right as ColumnType[]) ||
            [])?.[0];

        return [...(pinnedColumns.left || []), ...(pinnedColumns.right || []).reverse()]
            .reduce((acc: PinnedColumn[], column: ColumnType, index: number) => {
                const {
                    left: preLeft = checkboxSelection ? CHECKBOX_SIZE.toString() : '0',
                    right: preRight = '0',
                    fixed: preFixed,
                    width: preWidth = 0,
                } = acc[index - 1] || {};

                const left = column.fixed === 'left' ? parseInt(preLeft) + preWidth : 0;
                const right =
                    column.fixed === 'right'
                        ? parseInt(preRight) +
                          (preFixed === 'right' ? preWidth : 0) +
                          scrollYSize +
                          (preFixed === 'right' ? -scrollYSize : 0)
                        : 0;

                acc.push(
                    getCellClassName(
                        {
                            ...column,
                            left: `${left}px`,
                            right: `${right}px`,
                        },
                        pinnedLeftLast,
                        pinnedRightFirst,
                    ),
                );
                return acc;
            }, [])
            .reduce((acc: Record<ColumnType['field'], PinnedColumn>, column: PinnedColumn) => {
                acc[column.field] = column;
                return acc;
            }, {});
    }, [columns, scrollYSize]);

    // init table sx
    const sxFieldClass = useMemo(() => {
        const sxProperty = Object.entries(pinnedColumnPos).reduce(
            (acc, [key, value]) => {
                acc[value.posClassName!] = {
                    [value.fixed!]: value[value.fixed!],
                };
                return acc;
            },
            {} as Record<string, Record<string, any>>,
        );
        // If multiple selections and has left fixed, the checkbox should be fixed left
        if (
            checkboxSelection &&
            Object.values(pinnedColumnPos).some((v: PinnedColumn) => v.fixed === 'left')
        ) {
            ROW_CHECKBOX_CLASS.forEach((value: string) => {
                sxProperty[value] = {
                    position: 'sticky',
                    'z-index': 6,
                    left: 0,
                };
            });
        }
        return sxProperty;
    }, [pinnedColumnPos, scrollYSize]);

    useEffect(() => {
        if (!columns.some(column => !!column.fixed)) {
            return;
        }
        apiRef.current?.unstable_setColumnVirtualization(false);
        apiRef.current.subscribeEvent('stateChange', state => {
            setScrollYSize(state.dimensions.hasScrollY ? state.dimensions.scrollbarSize : 0);
        });
    }, [apiRef.current, columns]);

    // Grouping based on the fixed value enables the aggregation of the same type
    const sortGroupByFixed = (memoColumns: ColumnType<T>[]) => {
        return memoColumns.some(v => !!v.fixed)
            ? orderBy(
                  memoColumns,
                  [
                      item => {
                          return (
                              ({ left: -1, right: 1 } as Record<string, number>)[item.fixed!] ?? 0
                          );
                      },
                  ],
                  ['asc'],
              )
            : (memoColumns as readonly GridColDef<T>[]);
    };

    return {
        /** fixed column */
        pinnedColumnPos,
        /** column field class sx */
        sxFieldClass,
        /** sort group by fixed */
        sortGroupByFixed,
    };
};

export default usePinnedColumn;
