import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase, xhrDownload } from '@milesight/shared/src/utils/tools';
import { getCurrentComponentLang } from '@milesight/shared/src/services/i18n';
import { getAuthorizationToken } from '@milesight/shared/src/utils/request/utils';
import { IosShareIcon, toast } from '@milesight/shared/src/components';
import { TablePro, useConfirm } from '@/components';
import { DateRangePickerValueType } from '@/components/date-range-picker';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    API_PREFIX,
} from '@/services/http';
import useColumns, {
    type UseColumnsProps,
    type TableRowDataType,
} from '../../hooks/useEntityColumns';
import Detail from '../detail';
import EditEntity from '../edit-entity';
import ExportModal from '../export-modal';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [exportVisible, setExportVisible] = useState<boolean>(false);
    const [detail, setDetail] = useState<TableRowDataType | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword,
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
            refreshDeps: [keyword, paginationModel],
        },
    );

    const handleShowExport = () => {
        if (!selectedIds?.length) {
            toast.error(
                getIntlText('valid.resp.at_least_one', { 1: getIntlText('common.label.entity') }),
            );
            return;
        }
        setExportVisible(true);
    };

    const handleCloseExport = () => {
        setExportVisible(false);
    };

    const handleExportConfirm = async (time: DateRangePickerValueType | null) => {
        if (!selectedIds?.length) {
            return;
        }
        let url = `${API_PREFIX}/entity/export?`;
        selectedIds.forEach((id: ApiKey) => {
            url += `&ids=${id}`;
        });
        if (time?.start) {
            url += `&start_timestamp=${time?.start.valueOf()}`;
        }
        if (time?.end) {
            url += `&end_timestamp=${(time?.end.valueOf() || 0) + 86399000}`;
        }
        xhrDownload({
            assets: url,
            fileName: 'entity.csv',
            header: {
                'Accept-Language': getCurrentComponentLang(),
                Authorization: getAuthorizationToken(),
            },
        }).then(() => {
            getList();
            setSelectedIds([]);
            handleCloseExport();
            toast.success(getIntlText('common.message.operation_success'));
        });
    };

    /** Details event related */
    const handleDetail = (data: TableRowDataType) => {
        setDetail(data);
        setDetailVisible(true);
    };

    const handleDetailClose = () => {
        setDetailVisible(false);
        setDetail(null);
    };

    /** Edit event related */
    const showEdit = (data: TableRowDataType) => {
        setDetail(data);
        setEditVisible(true);
    };

    const handleEditClose = () => {
        setEditVisible(false);
        setDetail(null);
    };

    const handleEdit = async (name: string) => {
        const [error, resp] = await awaitWrap(
            entityAPI.editEntity({ name, id: detail?.entityId || '' }),
        );

        if (error || !isRequestSuccess(resp)) return;

        setEditVisible(false);
        getList();
        setDetail(null);
        toast.success(getIntlText('common.message.operation_success'));
    };

    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<IosShareIcon />}
                    onClick={handleShowExport}
                >
                    {getIntlText('common.label.export')}
                </Button>
            </Stack>
        );
    }, [getIntlText, handleExportConfirm, selectedIds]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            switch (type) {
                case 'detail': {
                    handleDetail(record);
                    break;
                }
                case 'edit': {
                    showEdit(record);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [navigate, handleExportConfirm],
    );
    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });

    return (
        <div className="ms-main">
            <TablePro<TableRowDataType>
                checkboxSelection
                loading={loading}
                columns={columns}
                getRowId={record => record.entityId}
                rows={entityData?.content}
                rowCount={entityData?.total || 0}
                paginationModel={paginationModel}
                rowSelectionModel={selectedIds}
                // isRowSelectable={({ row }) => row.deletable}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onRowDoubleClick={({ row }) => {
                    navigate(`/device/detail/${row.entityId}`, { state: row });
                }}
                onSearch={setKeyword}
                onRefreshButtonClick={getList}
            />
            {!!detailVisible && !!detail && <Detail onCancel={handleDetailClose} detail={detail} />}
            {!!editVisible && !!detail && (
                <EditEntity onCancel={handleEditClose} onOk={handleEdit} data={detail} />
            )}
            {!!exportVisible && (
                <ExportModal onCancel={handleCloseExport} onOk={handleExportConfirm} />
            )}
        </div>
    );
};
