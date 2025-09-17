import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { safeJsonParse } from '@milesight/shared/src/utils/tools';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, DeleteOutlineIcon, EventNoteIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type CamthinkAPISchema } from '@/services/http';
import { ImagePreview, CodePreview, StatusTag } from './components';

type OperationType = 'detail' | 'log' | 'delete';

export type TableRowDataType = CamthinkAPISchema['getBoundDevices']['response']['content'][0];

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
                field: 'device_id',
                headerName: getIntlText('device.label.param_device_id'),
                minWidth: 160,
                ellipsis: true,
            },
            {
                field: 'device_name',
                headerName: getIntlText('device.label.param_device_name'),
                minWidth: 160,
                ellipsis: true,
            },
            {
                field: 'current_model_name',
                headerName: getIntlText('setting.integration.ai_bind_label_ai_model_name'),
                minWidth: 160,
                ellipsis: true,
            },
            {
                field: 'origin_image',
                headerName: getIntlText('setting.integration.ai_bind_label_origin_image'),
                minWidth: 160,
                cellClassName: 'd-flex align-items-center',
                renderCell({ id, value }) {
                    if (!value) return '-';
                    return <ImagePreview id={id} src={value} />;
                },
            },
            {
                field: 'result_image',
                headerName: getIntlText('setting.integration.ai_bind_label_result_image'),
                minWidth: 160,
                cellClassName: 'd-flex align-items-center',
                renderCell({ id, value }) {
                    if (!value) return '-';
                    return <ImagePreview id={id} src={value} />;
                },
            },
            {
                field: 'model_name',
                headerName: getIntlText('setting.integration.ai_bind_label_inference_model_name'),
                minWidth: 160,
                ellipsis: true,
            },
            {
                field: 'infer_outputs_data',
                headerName: getIntlText('setting.integration.ai_bind_label_infer_result'),
                minWidth: 160,
                cellClassName: 'd-flex align-items-center',
                renderCell({ id, value }) {
                    if (!value) return '-';
                    const content = JSON.stringify(safeJsonParse(value), null, 2);
                    return <CodePreview id={id} content={content} />;
                },
            },
            {
                field: 'infer_status',
                headerName: getIntlText('setting.integration.ai_bind_label_infer_status'),
                minWidth: 160,
                renderCell({ row: { infer_status: status } }) {
                    if (!status) return '-';
                    return <StatusTag status={status} />;
                },
            },
            {
                field: 'uplink_at',
                headerName: getIntlText('setting.integration.ai_bind_label_device_uplink_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    if (!value) return '-';
                    return getTimeFormat(value);
                },
            },
            {
                field: 'infer_at',
                headerName: getIntlText('setting.integration.ai_bind_label_infer_time'),
                ellipsis: true,
                flex: 1,
                minWidth: 150,
                renderCell({ value }) {
                    if (!value) return '-';
                    return getTimeFormat(value);
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                display: 'flex',
                align: 'left',
                fixed: 'right',
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
                            <Tooltip title={getIntlText('common.label.log')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('log', row)}
                                >
                                    <EventNoteIcon sx={{ width: 20, height: 20 }} />
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
