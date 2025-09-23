import { useMemo } from 'react';
import { isBoolean } from 'lodash-es';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { type ColumnType } from '@/components';
import { type EntityAPISchema } from '@/services/http';
import { TableRowDataType } from '../../hooks/useColumns';

export type HistoryRowDataType = ObjectToCamelCase<
    EntityAPISchema['getHistory']['response']['content'][0]
>;

export interface UseColumnsProps {
    /**
     * filtered info
     */
    filteredInfo: Record<string, any>;
    /** entity data info */
    detail?: TableRowDataType | null;
}

const useColumns = <T extends HistoryRowDataType>({ filteredInfo, detail }: UseColumnsProps) => {
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
                    let result: string = detail?.entityValueAttribute?.enum?.[value] || value;
                    if (['true', 'false'].includes(result) || isBoolean(result)) {
                        result = String(result).toUpperCase();
                    }
                    return result;
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
    }, [getIntlText, getTimeFormat, filteredInfo, detail]);

    return columns;
};

export default useColumns;
