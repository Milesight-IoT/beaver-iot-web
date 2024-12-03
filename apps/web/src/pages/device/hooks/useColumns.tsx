import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type DeviceAPISchema } from '@/services/http';

type OperationType = 'detail' | 'delete';

export type TableRowDataType = ObjectToCamelCase<
    DeviceAPISchema['getList']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * 操作 Button 点击回调
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: getIntlText('device.label.param_device_name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                // disableColumnMenu: false,
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(value);
                },
            },
            {
                field: 'integrationName',
                headerName: getIntlText('device.label.param_source'),
                ellipsis: true,
                flex: 2,
                minWidth: 200,
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                flex: 2,
                minWidth: 100,
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip title={getIntlText('common.label.detail')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('detail', row)}
                                >
                                    <ListAltIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('common.label.delete')}>
                                <IconButton
                                    color="error"
                                    disabled={!row.deletable}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                        '&:hover': { color: 'error.light' },
                                    }}
                                    onClick={() => onButtonClick('delete', row)}
                                >
                                    <DeleteOutlineIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, getTimeFormat, onButtonClick]);

    return columns;
};

export default useColumns;
