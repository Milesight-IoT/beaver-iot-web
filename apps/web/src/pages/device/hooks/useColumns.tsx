import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType, PermissionControlHidden } from '@/components';
import { type DeviceAPISchema } from '@/services/http';
import { PERMISSIONS } from '@/constants';

type OperationType = 'detail' | 'delete';

export type TableRowDataType = ObjectToCamelCase<
    DeviceAPISchema['getList']['response']['content'][0]
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
                flex: 2,
                minWidth: 350,
                ellipsis: true,
                // disableColumnMenu: false,
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 200,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(value);
                },
            },
            {
                field: 'integrationName',
                headerName: getIntlText('device.label.param_source'),
                ellipsis: true,
                flex: 1,
                minWidth: 300,
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
                            <Tooltip title={getIntlText('common.label.detail')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('detail', row)}
                                >
                                    <ListAltIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <PermissionControlHidden permissions={PERMISSIONS.DEVICE_DELETE}>
                                <Tooltip title={getIntlText('common.label.delete')}>
                                    <IconButton
                                        // color="error"
                                        disabled={!row.deletable}
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
                            </PermissionControlHidden>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, getTimeFormat, onButtonClick]);

    return columns;
};

export default useColumns;
