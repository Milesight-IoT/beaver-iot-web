import { useState, useRef, useCallback } from 'react';
import { Button, Popover } from '@mui/material';
import { useRequest } from 'ahooks';
import { cloneDeep } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { Modal } from '@milesight/shared/src/components';
import { DateRangePickerValueType } from '@/components/date-range-picker';
import { DateRangePicker, TablePro } from '@/components';
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
    const [time, setTime] = useState<DateRangePickerValueType | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const [isShowFilter, setIsShowFilter] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    // Store the selected time range and send it to the backend as a filter condition when the confirm button is clicked.
    const timeRef = useRef<DateRangePickerValueType | null>(null);

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            setDataLoading(true);
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                entityAPI.getHistory({
                    entity_id: detail.entityId,
                    start_timestamp: timeRef.current?.start
                        ? timeRef.current?.start.valueOf()
                        : undefined,
                    end_timestamp: timeRef.current?.end
                        ? (timeRef.current?.end.valueOf() || 0) + 86399000
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
            refreshDeps: [paginationModel],
        },
    );

    /** Filter relevant events */
    const showFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsShowFilter(true);
        setAnchorEl(e.currentTarget);
    };

    const handleCloseFilterPopover = () => {
        setIsShowFilter(false);
    };

    const changeFilter = (values: DateRangePickerValueType | null) => {
        setTime(values);
    };

    const handleResetFilter = () => {
        setTime(null);
        timeRef.current = null;
    };

    const handleConfirmFilter = () => {
        handleCloseFilterPopover();
        timeRef.current = cloneDeep(time);
        getList();
    };

    const handleTableBtnClick: UseColumnsProps<HistoryRowDataType>['onButtonClick'] = useCallback(
        (type, e) => {
            switch (type) {
                case 'filter': {
                    showFilter(e);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [showFilter],
    );
    const columns = useColumns<HistoryRowDataType>({
        onButtonClick: handleTableBtnClick,
        isShowFilter,
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
                    height: !entityData?.content?.length && !dataLoading ? '400px' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
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
                        getRowId={record => record.timestamp}
                        rows={entityData?.content}
                        rowCount={entityData?.total || 0}
                        paginationModel={paginationModel}
                        toolbarRender={false}
                        onPaginationModelChange={setPaginationModel}
                        onRefreshButtonClick={getList}
                    />
                </div>
                <Popover
                    open={isShowFilter}
                    anchorEl={anchorEl}
                    onClose={handleCloseFilterPopover}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <div className="entity-detail-filter-popover">
                        <DateRangePicker
                            label={{ start: 'Start date', end: 'End date' }}
                            onChange={changeFilter}
                            value={time}
                            views={['year', 'month', 'day']}
                        />
                        <div className="entity-detail-filter-popover-footer">
                            <div className="entity-detail-filter-popover-footer-reset">
                                <Button onClick={handleResetFilter} variant="outlined">
                                    {getIntlText('common.button.reset')}
                                </Button>
                            </div>
                            <Button onClick={handleConfirmFilter} variant="contained">
                                {getIntlText('common.button.confirm')}
                            </Button>
                        </div>
                    </div>
                </Popover>
            </div>
        </Modal>
    );
};
