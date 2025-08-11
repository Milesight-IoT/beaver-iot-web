import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    DeleteOutlineIcon,
    DevicesOtherIcon,
    TuneOutlinedIcon,
} from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { GatewayAPISchema } from '@/services/http/embedded-ns';
import GatewayStatus from '../component/gateway-status';

type OperationType = 'device' | 'detail' | 'delete';

export type TableRowDataType = ObjectToCamelCase<
    GatewayAPISchema['getList']['response']['gateways'][0]
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
                headerName: getIntlText('setting.integration.label.gateway_name'),
                flex: 1,
                minWidth: 200,
                ellipsis: true,
            },
            {
                field: 'status',
                headerName: getIntlText('setting.integration.label.status'),
                flex: 1,
                minWidth: 200,
                ellipsis: false,
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center' }}
                        >
                            <GatewayStatus status={row.status} />
                        </Stack>
                    );
                },
            },
            {
                field: 'credentialId',
                headerName: getIntlText('setting.integration.label.credential'),
                ellipsis: true,
                flex: 1,
                minWidth: 200,
            },
            {
                field: 'applicationId',
                headerName: getIntlText('setting.integration.label.application_id'),
                ellipsis: true,
                flex: 1,
                minWidth: 200,
            },
            {
                field: 'deviceCount',
                headerName: getIntlText('setting.integration.label.device_count'),
                ellipsis: true,
                flex: 1,
                minWidth: 200,
                renderCell({ value }) {
                    return String(value);
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
                            <Tooltip title={getIntlText('setting.integration.label.sub_device')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('device', row)}
                                >
                                    <DevicesOtherIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('common.label.detail')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('detail', row)}
                                >
                                    <TuneOutlinedIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('common.label.delete')}>
                                <IconButton
                                    // color="error"
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
