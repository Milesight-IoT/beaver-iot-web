import { useMemo } from 'react';
import { Stack, IconButton, Link } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    DeleteOutlineIcon,
    EditIcon,
    PlayCircleOutlineIcon,
} from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { MqttDeviceAPISchema } from '@/services/http/mqtt';

type OperationType = 'edit' | 'test' | 'delete' | 'count';

export type TableRowDataType = ObjectToCamelCase<
    MqttDeviceAPISchema['getList']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * Operation Button click callback
     */
    onButtonClick: (type: OperationType, record: T) => void;
    searchByTemplate: (template: TableRowDataType) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: getIntlText('setting.integration.device_template_name'),
                flex: 1,
                minWidth: 200,
                ellipsis: true,
            },
            {
                field: 'topic',
                headerName: getIntlText('setting.integration.mqtt_topic'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
            },
            {
                field: 'deviceCount',
                headerName: getIntlText('user.role.integration_num_device_table_title'),
                flex: 1,
                minWidth: 100,
                maxWidth: 160,
                renderCell({ row, value }) {
                    return (
                        <Stack>
                            <Link
                                underline="hover"
                                component="button"
                                onClick={() => onButtonClick('count', row)}
                            >
                                {String(value)}
                            </Link>
                        </Stack>
                    );
                },
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                minWidth: 160,
                maxWidth: 160,
                renderCell({ value }) {
                    return value ? getTimeFormat(value) : '';
                },
            },
            {
                field: 'description',
                headerName: getIntlText('common.label.remark'),
                ellipsis: true,
                flex: 1,
                minWidth: 200,
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
                            <Tooltip title={getIntlText('common.button.edit')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('edit', row)}
                                >
                                    <EditIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('setting.integration.test_data')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('test', row)}
                                >
                                    <PlayCircleOutlineIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('common.label.delete')}>
                                <IconButton
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
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
