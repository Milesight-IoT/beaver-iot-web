import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { GatewayAPISchema } from '@/services/http/embedded-ns';

type OperationType = 'device' | 'detail' | 'delete';

export type TableRowDataType = ObjectToCamelCase<
    GatewayAPISchema['getSyncedDevices']['response'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * Operation Button click callback
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
                minWidth: 180,
                ellipsis: true,
            },
            {
                field: 'eui',
                headerName: getIntlText('setting.integration.label.device_eui'),
                flex: 1,
                minWidth: 180,
                ellipsis: true,
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                ellipsis: true,
                flex: 1,
                minWidth: 200,
                renderCell({ value }) {
                    return value ? getTimeFormat(value) : '';
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                display: 'flex',
                align: 'left',
                headerAlign: 'left',
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip title={getIntlText('common.label.delete')}>
                                <IconButton
                                    // color="error"
                                    // disabled={!row.deletable}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                        // '&:hover': { color: 'error.light' },
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
