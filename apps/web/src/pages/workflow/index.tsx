import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import {
    AddIcon,
    DeleteOutlineIcon,
    SystemUpdateAltIcon,
    ErrorIcon,
    toast,
} from '@milesight/shared/src/components';
import { Breadcrumbs, TablePro, useConfirm } from '@/components';
import { awaitWrap, isRequestSuccess, workflowAPI } from '@/services/http';
import { type FormDataProps as ImportFormDataProps } from '@/pages/workflow/components/import-modal/hook/useImportFormItems';
import { ImportModal, LogModal } from '@/pages/workflow/components';
import { useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';
import './style.less';

const Workflow = () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- 列表数据相关逻辑 ----------
    const [keyword, setKeyword] = useState<string>();
    const [importModal, setImportModal] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [logModalVisible, setLogModalVisible] = useState(false);
    const {
        data: workflowList,
        loading,
        run: getWorkflowList,
    } = useRequest(
        async () => {
            // const { page, pageSize } = paginationModel;
            // const [error, resp] = await awaitWrap(
            //     deviceAPI.getList({
            //         name: keyword,
            //         page_size: pageSize,
            //         page_number: page + 1,
            //     }),
            // );
            // const data = getResponseData(resp);

            // // console.log({ error, resp });
            // if (error || !data || !isRequestSuccess(resp)) return;

            // return objectToCamelCase(data);
            return {};
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

    // ---------- 数据删除相关逻辑 ----------
    const confirm = useConfirm();
    const warnIcon = useMemo(() => {
        return <ErrorIcon className="ms-workflowIcon modal-waringIcon" />;
    }, []);
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];
            confirm({
                title: getIntlText('workflow.label.deletion'),
                icon: warnIcon,
                description: getIntlText('workflow.message.delete_tip'),
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        workflowAPI.deleteFlow({ id: idsToDelete }),
                    );

                    // console.log({ error, resp });
                    if (error || !isRequestSuccess(resp)) return;

                    getWorkflowList();
                    setSelectedIds(pre => {
                        return pre.filter(ids => !idsToDelete.includes(ids));
                    });
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getWorkflowList, selectedIds],
    );
    const handlerAddModal = () => {
        navigate('/workflow/editor');
    };
    // ---------- Table 渲染相关 ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={handlerAddModal}
                >
                    {getIntlText('common.label.add')}
                </Button>
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<SystemUpdateAltIcon />}
                    onClick={() => handlerImportModal(true)}
                >
                    {getIntlText('workflow.button.label_import_from_dsl')}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={!selectedIds.length}
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleDeleteConfirm()}
                >
                    {getIntlText('workflow.button.delete_filter')}
                </Button>
            </Stack>
        );
    }, [getIntlText, handleDeleteConfirm, selectedIds]);
    const handlerImportModal = useCallback(
        (isOpen: boolean, contains?: WorkflowSchema) => {
            if (contains) {
                // TODO: wid should be deleted
                navigate('/workflow/editor?wid=12121', {
                    state: {
                        workflowSchema: contains,
                    },
                });
            }
            setImportModal(isOpen);
        },
        [navigate],
    );

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            // console.log(type, record);
            switch (type) {
                case 'edit': {
                    navigate(`/workflow/editor?wid=${record.id}`);
                    break;
                }
                case 'detail': {
                    // TODO: workflow id 传参
                    navigate('/workflow/editor');
                    break;
                }
                case 'delete': {
                    handleDeleteConfirm([record.id]);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [navigate, handleDeleteConfirm],
    );
    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });
    const handleCloseLogModal = useCallback(() => setLogModalVisible(false), []);
    const isRowSelectable = useCallback(
        ({ row }: { row: TableRowDataType }) => {
            return !row.enabled;
        },
        [columns],
    );
    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-workflow">
                <div className="ms-view__inner">
                    <TablePro<TableRowDataType>
                        checkboxSelection
                        loading={loading}
                        columns={columns}
                        // rows={deviceData?.content}
                        // rowCount={workflowList?.total || 0}
                        paginationModel={paginationModel}
                        rowSelectionModel={selectedIds}
                        isRowSelectable={isRowSelectable}
                        toolbarRender={toolbarRender}
                        onPaginationModelChange={setPaginationModel}
                        onRowSelectionModelChange={setSelectedIds}
                        onRowDoubleClick={({ row }) => {
                            navigate(`/device/detail/${row.id}`, { state: row });
                        }}
                        onSearch={setKeyword}
                        onRefreshButtonClick={getWorkflowList}
                    />
                </div>
            </div>
            {logModalVisible && (
                <LogModal visible={logModalVisible} onCancel={handleCloseLogModal} />
            )}
            <ImportModal
                visible={importModal}
                onUpload={param => handlerImportModal(false, param)}
                onCancel={() => handlerImportModal(false)}
            />
        </div>
    );
};

export default Workflow;
