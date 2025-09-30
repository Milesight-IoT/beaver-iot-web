import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase, linkDownload } from '@milesight/shared/src/utils/tools';
import {
    AddIcon,
    DeleteOutlineIcon,
    SystemUpdateAltIcon,
    ErrorIcon,
    toast,
} from '@milesight/shared/src/components';
import { Breadcrumbs, TablePro, useConfirm, PermissionControlHidden } from '@/components';
import { awaitWrap, getResponseData, isRequestSuccess, workflowAPI } from '@/services/http';
import { ImportModal, LogModal } from '@/pages/workflow/components';
import { PERMISSIONS } from '@/constants';
import { useUserPermissions } from '@/hooks';
import { useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';
import './style.less';

const Workflow = () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();

    // ---------- Fetch Workflow List ----------
    const [keyword, setKeyword] = useState<string>();
    const [importModal, setImportModal] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [logModalVisible, setLogModalVisible] = useState(false);
    const [workflowItem, setWorkflowItem] = useState<TableRowDataType>();
    const {
        data: workflowList,
        loading,
        run: getWorkflowList,
        mutate: updateWorkflowList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                workflowAPI.getList({
                    name: keyword || '',
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

    // ---------- Delete Flow ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];
            confirm({
                title: getIntlText('common.label.deletion'),
                icon: <ErrorIcon className="ms-workflowIcon modal-waringIcon" />,
                description: getIntlText('workflow.message.delete_tip'),
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        workflowAPI.deleteFlows({ workflow_id_list: idsToDelete }),
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

    // ---------- Workflow Row Data Interaction ----------
    const handleExportWorkFlow = useCallback(async (record: TableRowDataType) => {
        const [error, resp] = await awaitWrap(
            workflowAPI.getFlowDesign({ id: record.id, version: '' }),
        );

        if (error || !isRequestSuccess(resp)) return;
        // exportJsonFile(getResponseData(resp) as WorkflowAPISchema['getFlowDesign']['response']);
        const { name, design_data: designData = '{}' } = getResponseData(resp) || {};
        const blob = new Blob([JSON.stringify(JSON.parse(designData), null, 4)], {
            type: 'application/json',
        });

        linkDownload(blob, `${name}.json`);
    }, []);

    const handleSwitchChange = useCallback(
        async (row: TableRowDataType) => {
            if (!workflowList?.content) {
                return;
            }
            const { enabled } = row;
            const [error, res] = await awaitWrap(
                workflowAPI.enableFlow({
                    id: row.id,
                    status: enabled ? 'disable' : 'enable',
                }),
            );
            updateWorkflowList({
                ...workflowList,
                content: workflowList?.content.map(item =>
                    item.id === row.id
                        ? {
                              ...item,
                              enabled:
                                  error || !isRequestSuccess(res) ? item.enabled : !item.enabled,
                          }
                        : item,
                ),
            });
        },
        [workflowList, updateWorkflowList],
    );

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            // console.log(type, record);
            switch (type) {
                case 'edit': {
                    navigate(`/workflow/editor?wid=${record.id}`);
                    break;
                }
                case 'log': {
                    setWorkflowItem(record);
                    setLogModalVisible(true);
                    break;
                }
                case 'delete': {
                    handleDeleteConfirm([record.id]);
                    break;
                }
                case 'enable': {
                    handleSwitchChange(record);
                    break;
                }
                case 'export': {
                    handleExportWorkFlow(record);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [navigate, handleDeleteConfirm, handleExportWorkFlow, handleSwitchChange],
    );

    // ---------- Table Render ----------
    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });
    const isRowSelectable = useCallback(({ row }: { row: TableRowDataType }) => {
        return !row.enabled;
    }, []);
    const handlerImportModal = useCallback(
        (isOpen: boolean, contains?: WorkflowSchema) => {
            if (contains) {
                // TODO: wid should be deleted
                navigate('/workflow/editor', {
                    state: {
                        workflowSchema: contains,
                    },
                });
            }
            setImportModal(isOpen);
        },
        [navigate],
    );
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <PermissionControlHidden permissions={PERMISSIONS.WORKFLOW_ADD}>
                    <Button
                        variant="contained"
                        className="md:d-none"
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/workflow/editor')}
                    >
                        {getIntlText('common.label.add')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.WORKFLOW_ADD}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<SystemUpdateAltIcon />}
                        onClick={() => handlerImportModal(true)}
                    >
                        {getIntlText('workflow.button.label_import_from_dsl')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.WORKFLOW_DELETE}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        disabled={!selectedIds.length}
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleDeleteConfirm()}
                    >
                        {getIntlText('common.label.delete')}
                    </Button>
                </PermissionControlHidden>
            </Stack>
        );
    }, [getIntlText, navigate, handleDeleteConfirm, handlerImportModal, selectedIds]);

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-workflow">
                <div className="ms-view__inner">
                    <TablePro<TableRowDataType>
                        className="ms-workflow-table"
                        filterCondition={[keyword]}
                        checkboxSelection={hasPermission(PERMISSIONS.WORKFLOW_DELETE)}
                        loading={loading}
                        columns={columns}
                        rows={workflowList?.content}
                        rowCount={workflowList?.total || 0}
                        rowHeight={64}
                        paginationModel={paginationModel}
                        rowSelectionModel={selectedIds}
                        isRowSelectable={isRowSelectable}
                        toolbarRender={toolbarRender}
                        onPaginationModelChange={setPaginationModel}
                        onRowSelectionModelChange={setSelectedIds}
                        onRowDoubleClick={({ row }) => {
                            if (!hasPermission(PERMISSIONS.WORKFLOW_EDIT)) {
                                return;
                            }

                            navigate(`/workflow/editor?wid=${row.id}`);
                        }}
                        onSearch={value => {
                            setKeyword(value);
                            setPaginationModel(model => ({ ...model, page: 0 }));
                        }}
                        onRefreshButtonClick={getWorkflowList}
                    />
                </div>
            </div>
            {logModalVisible && (
                <LogModal
                    visible={logModalVisible}
                    data={workflowItem!}
                    onCancel={() => setLogModalVisible(false)}
                />
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
