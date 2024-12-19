import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { IosShareIcon, toast } from '@milesight/shared/src/components';
import { TablePro, useConfirm } from '@/components';
import { entityAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import useColumns, {
    type UseColumnsProps,
    type TableRowDataType,
} from '../../hooks/useEntityColumns';
import Detail from '../detail';
import EditEntity from '../edit-entity';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [detail, setDetail] = useState<TableRowDataType | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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

    const confirm = useConfirm();
    const handleExportConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];

            confirm({
                title: getIntlText('common.label.delete'),
                description: getIntlText('device.message.delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                confirmButtonProps: {
                    color: 'error',
                },
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        entityAPI.deleteEntities({ entity_ids: idsToDelete }),
                    );

                    if (error || !isRequestSuccess(resp)) return;

                    getList();
                    setSelectedIds([]);
                    toast.success(getIntlText('common.message.operation_success'));
                },
            });
        },
        [confirm, getIntlText, getList, selectedIds],
    );

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
            entityAPI.editEntity({ id: detail?.entityId || '', entity_name: name }),
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
                    aria-controls={open ? 'add-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    startIcon={<IosShareIcon />}
                    onClick={handleClick}
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
        </div>
    );
};
