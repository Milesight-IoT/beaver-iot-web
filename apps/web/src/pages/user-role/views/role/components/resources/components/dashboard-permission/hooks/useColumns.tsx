import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { RemoveCircleOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type UserAPISchema } from '@/services/http';

type OperationType = 'remove';

export type TableRowDataType = ObjectToCamelCase<
    UserAPISchema['getRoleAllDashboards']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * operation Button callbacks
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'dashboardName',
                headerName: getIntlText('dashboard.dashboard_name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'userNickname',
                headerName: getIntlText('common.label.creator'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(Number(value));
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                display: 'flex',
                align: 'left',
                headerAlign: 'left',
                fixed: 'right',
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip title={getIntlText('common.label.remove')}>
                                <IconButton
                                    // color="error"
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                        // '&:hover': { color: 'error.light' },
                                    }}
                                    onClick={() => onButtonClick('remove', row)}
                                >
                                    <RemoveCircleOutlineIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, onButtonClick, getTimeFormat]);

    return columns;
};

export default useColumns;
