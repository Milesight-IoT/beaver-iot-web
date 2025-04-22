import { useMemo } from 'react';
import { IconButton } from '@mui/material';
import classnames from 'classnames';
import { isBoolean } from 'lodash-es';

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
     * filtered info
     */
    filteredInfo: Record<string, any>;
}

const useColumns = <T extends HistoryRowDataType>({ filteredInfo }: UseColumnsProps<T>) => {
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
                renderCell({ value }) {
                    return isBoolean(value) ? String(value) : value;
                },
            },
            {
                field: 'timestamp',
                headerName: getIntlText('common.label.update_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                filterSearchType: 'datePicker',
                filteredValue: filteredInfo?.timestamp,
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
    }, [getIntlText, getTimeFormat, filteredInfo]);

    return columns;
};

export default useColumns;
