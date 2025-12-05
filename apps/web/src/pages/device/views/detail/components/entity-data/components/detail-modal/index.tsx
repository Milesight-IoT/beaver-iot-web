import React, { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { FiltersRecordType, TablePro } from '@/components';
import { entityAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { TableRowDataType } from '../../hooks';
import BasicInfo from './basicInfo';
import useColumns, { type HistoryRowDataType } from './useColumns';
import './style.less';

interface Props extends ModalProps {
    detail?: TableRowDataType | null;
}

const DEFAULT_PAGINATION_MODEL = { page: 0, pageSize: 10 };

/**
 * Entity detail modal
 */
const DetailModal: React.FC<Props> = ({ detail, visible, ...props }) => {
    const { getIntlText } = useI18n();
    const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});
    const columns = useColumns<HistoryRowDataType>({
        filteredInfo,
        detail,
    });

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            if (!detail || !visible) return;
            const { page, pageSize } = paginationModel;
            const { timestamp } = filteredInfo;
            const [error, resp] = await awaitWrap(
                entityAPI.getHistory({
                    entity_id: detail.entityId,
                    start_timestamp: (timestamp?.[0] as any)?.start
                        ? (timestamp?.[0] as any)?.start.valueOf()
                        : undefined,
                    end_timestamp: (timestamp?.[0] as any)?.end
                        ? ((timestamp?.[0] as any)?.end.valueOf() || 0) + 86399000
                        : undefined, // Adding 86399000 manually here is to ensure the end time is 23:59:59.
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [detail, visible, paginationModel, filteredInfo],
        },
    );

    // Reset pagination model when modal is closed
    useEffect(() => {
        if (visible) return;
        setPaginationModel(DEFAULT_PAGINATION_MODEL);
    }, [visible]);

    return (
        <Modal
            {...props}
            showCloseIcon
            footer={null}
            visible={visible}
            title={getIntlText('common.label.detail')}
            width="900px"
            sx={{
                '& .MuiDialogContent-root': {
                    // height: !entityData?.content?.length && !dataLoading ? '400px' : 'auto',
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '8px',
                },
            }}
        >
            <div className="ms-device-entity-detail">
                <BasicInfo data={detail} />
                <div className="ms-device-entity-detail-table-header">
                    <div className="ms-device-entity-detail-table-header-title">
                        {getIntlText('entity.label.historical_data')}
                    </div>
                </div>
                <div className="ms-device-entity-detail-table">
                    <TablePro<HistoryRowDataType>
                        loading={loading}
                        columns={columns}
                        getRowId={record => record.id || record.timestamp}
                        rows={entityData?.content}
                        rowCount={entityData?.total || 0}
                        paginationModel={paginationModel}
                        toolbarRender={false}
                        onPaginationModelChange={setPaginationModel}
                        onRefreshButtonClick={getList}
                        onFilterInfoChange={filters => setFilteredInfo(filters)}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default DetailModal;
