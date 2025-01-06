import { useMemo } from 'react';
import { IconButton } from '@mui/material';
import classnames from 'classnames';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { FilterAltIcon } from '@milesight/shared/src/components';
import { type ColumnType } from '@/components';
import { type EntityAPISchema } from '@/services/http';

export type HistoryRowDataType = ObjectToCamelCase<
    EntityAPISchema['getHistory']['response']['content'][0]
>;

type OperationType = 'filter';

export interface UseColumnsProps<T> {
    /**
     * 操作 Button 点击回调
     */
    onButtonClick: (type: OperationType, e: React.MouseEvent<HTMLButtonElement>) => void;
    isShowFilter: boolean;
}

const useColumns = <T extends HistoryRowDataType>({
    onButtonClick,
    isShowFilter,
}: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'value',
                headerName: getIntlText('common.label.value'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'timestamp',
                headerName: getIntlText('common.label.update_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderHeader() {
                    return (
                        <div className="entity-detail-columns-header">
                            <div className="entity-detail-columns-header-label">
                                {getIntlText('common.label.update_time')}
                            </div>
                            <IconButton
                                aria-label="filter"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                                    onButtonClick('filter', e)
                                }
                            >
                                <FilterAltIcon
                                    className={classnames('entity-detail-columns-header-icon', {
                                        'entity-detail-columns-header-icon-active': isShowFilter,
                                    })}
                                />
                            </IconButton>
                        </div>
                    );
                },
                renderCell({ value }) {
                    if (!value) {
                        return null;
                    }
                    return getTimeFormat(Number(value));
                },
            },
            {
                field: 'entityValueSource',
                headerName: getIntlText('entity.label.value_source'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
        ];
    }, [getIntlText, getTimeFormat, isShowFilter]);

    return columns;
};

export default useColumns;
