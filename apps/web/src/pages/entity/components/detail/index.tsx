import { useState, useRef, useCallback } from 'react';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { Modal } from '@milesight/shared/src/components';
import { FiltersRecordType, FilterValue, TablePro, TableProProps } from '@/components';
import { entityAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { TableRowDataType } from '../../hooks';
import BasicInfo from './basicInfo';
import useColumns, { type UseColumnsProps, type HistoryRowDataType } from './useColumns';

interface IProps {
    detail: TableRowDataType;
    onCancel: () => void;
}

export default (props: IProps) => {
    const { getIntlText } = useI18n();
    const { detail, onCancel } = props;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [dataLoading, setDataLoading] = useState(true);
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            setDataLoading(true);
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
            setDataLoading(false);
            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [paginationModel, filteredInfo],
        },
    );

    // filter info change
    const handleFilterChange: TableProProps<TableRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    const columns = useColumns<HistoryRowDataType>({
        filteredInfo,
        detail,
    });

    return (
        <Modal
            visible
            showCloseIcon
            onCancel={onCancel}
            footer={null}
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
            <div className="entity-detail-contain">
                <BasicInfo data={detail} />
                <div className="entity-detail-table-header">
                    <div className="entity-detail-table-header-title">
                        {getIntlText('entity.label.historical_data')}
                    </div>
                </div>
                <div className="entity-detail-table">
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
                        onFilterInfoChange={handleFilterChange}
                    />
                </div>
            </div>
        </Modal>
    );
};
