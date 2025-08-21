import React, { useState, useMemo, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { safeJsonParse } from '@milesight/shared/src/utils/tools';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { TablePro, type ColumnType } from '@/components';
import {
    entityAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    type CamthinkAPISchema,
    type EntityAPISchema,
} from '@/services/http';
import StatusTag from '../status-tag';
import CodePreview from '../code-preview';
import ImagePreview from '../image-preview';
import './style.less';

interface Props extends ModalProps {
    /** Target device detail */
    device?: CamthinkAPISchema['getBoundDevices']['response']['content'][0] | null;
}

type LogDetailType = Pick<
    CamthinkAPISchema['getBoundDevices']['response']['content'][0],
    | 'model_name'
    | 'origin_image'
    | 'result_image'
    | 'infer_at'
    | 'uplink_at'
    | 'infer_status'
    | 'infer_outputs_data'
>;

type TableRowDataType = LogDetailType;

type HistoryItem = EntityAPISchema['getHistory']['response']['content'][0] & LogDetailType;

const LogModal: React.FC<Props> = ({ visible, device, ...props }) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    // ---------- Render Table ----------
    const historyId = device?.infer_history_entity_id;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const columns: ColumnType<TableRowDataType>[] = useMemo(
        () => [
            {
                field: 'origin_image',
                headerName: getIntlText('setting.integration.ai_bind_label_origin_image'),
                minWidth: 120,
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
                field: 'result_image',
                headerName: getIntlText('setting.integration.ai_bind_label_result_image'),
                minWidth: 120,
                cellClassName: 'd-flex align-items-center',
                renderCell({ id, value }) {
                    if (!value) return '-';
                    return <ImagePreview id={id} src={value} />;
                },
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
                align: 'left',
                headerAlign: 'left',
                renderCell({ row: { infer_status: status } }) {
                    if (!status) return '-';
                    return <StatusTag status={status} />;
                },
            },
        ],
        [getIntlText, getTimeFormat],
    );

    const {
        loading,
        run: getHistory,
        data: logData,
    } = useRequest(
        async () => {
            if (!historyId) return;
            const { page, pageSize } = paginationModel;
            const [err, resp] = await awaitWrap(
                entityAPI.getHistory({
                    entity_id: historyId,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );

            if (err || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);
            const list: HistoryItem[] =
                data?.content.map(item => {
                    return {
                        ...item,
                        ...(safeJsonParse(item.value) as LogDetailType),
                    };
                }) || [];

            // console.log({ data, list, resp });
            return {
                total: data?.total,
                content: list,
            };
        },
        {
            debounceWait: 300,
            refreshDeps: [historyId, paginationModel],
        },
    );

    // Reset pagination model when modal close
    useEffect(() => {
        if (visible) return;
        setPaginationModel({
            page: 0,
            pageSize: 10,
        });
    }, [visible]);

    return (
        <Modal
            {...props}
            showCloseIcon
            width="1200px"
            className="ms-com-log-modal"
            visible={visible}
            title={getIntlText('common.label.log')}
        >
            <TablePro<TableRowDataType>
                loading={loading}
                columns={columns}
                rows={logData?.content || []}
                rowCount={logData?.total || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onRefreshButtonClick={getHistory}
            />
        </Modal>
    );
};

export default LogModal;
