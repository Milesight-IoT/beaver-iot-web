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
    toast,
} from '@milesight/shared/src/components';
import { Breadcrumbs, TablePro, useConfirm } from '@/components';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { type FormDataProps } from '@/pages/workflow/components/edit-modal/hook/useWorkflowFormItems';
import { EditModal } from '@/pages/workflow/components';
import { useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';
import './style.less';

type ModalOption = {
    isAdd: boolean;
    openModal: boolean;
    dataSource: FormDataProps;
};

const Workflow = () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- 列表数据相关逻辑 ----------
    const [keyword, setKeyword] = useState<string>();
    const [editOption, SetEditOption] = useState<ModalOption>({
        isAdd: false,
        openModal: false,
        dataSource: {
            name: '',
            remark: '',
        },
    });
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
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
    const handleDeleteConfirm = useCallback(
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
                        deviceAPI.deleteDevices({ device_id_list: idsToDelete }),
                    );

                    // console.log({ error, resp });
                    if (error || !isRequestSuccess(resp)) return;

                    getWorkflowList();
                    setSelectedIds([]);
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getWorkflowList, selectedIds],
    );

    // ---------- Table 渲染相关 ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={() => handlerEditModal(true, true)}
                >
                    {getIntlText('common.label.add')}
                </Button>
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<SystemUpdateAltIcon />}
                    // onClick={() => setModalOpen(true)}
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
    const handlerEditModal = (isAdd: boolean, isOpen: boolean, row?: FormDataProps): void => {
        const newEditOption: ModalOption = {
            isAdd,
            openModal: isOpen,
            dataSource: {
                name: '',
                remark: '',
            },
        };
        if (!isAdd && isOpen) {
            newEditOption.dataSource = {
                name: row?.name ?? '',
                remark: row?.remark ?? '',
            };
        }
        SetEditOption(newEditOption);
    };
    const submitEditModal = async (data: FormDataProps) => {
        const { isAdd } = editOption;
        // const [error, res] = await awaitWrap(isAdd ? WorkflowAPI.addWorkflow(data) : WorkflowAPI.updateWorkflow(data));
        // if (isRequestSuccess(res)) {
        handlerEditModal(false, false);
        if (isAdd) {
            navigate('/workflow/editor', { state: data });
        } else {
            // toast.success(getIntlText('common.message.operation_success'));
        }
        // } else {
        //     toast.error(error);
        // }
    };
    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            // console.log(type, record);
            switch (type) {
                case 'edit': {
                    handlerEditModal(false, true, record);
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
                        // isRowSelectable={({ row }) => row.deletable}
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
            <EditModal
                visible={editOption.openModal}
                isAdd={editOption.isAdd}
                data={editOption.dataSource}
                onCancel={() => handlerEditModal(false, false)}
                onConfirm={submitEditModal}
            />
        </div>
    );
};

export default Workflow;
