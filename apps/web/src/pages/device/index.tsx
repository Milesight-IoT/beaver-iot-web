import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AddIcon, DeleteOutlineIcon, toast, ErrorIcon } from '@milesight/shared/src/components';
import { Breadcrumbs, TablePro, useConfirm, PermissionControlHidden } from '@/components';
import { PERMISSIONS } from '@/constants';
import { useUserPermissions } from '@/hooks';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';
import { AddModal } from './components';
import './style.less';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();

    // ---------- list data related to ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const {
        data: deviceData,
        loading,
        run: getDeviceList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const data = getResponseData(resp);

            // console.log({ error, resp });
            if (error || !data || !isRequestSuccess(resp)) return;

            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

    // ---------- Device added related ----------
    const [modalOpen, setModalOpen] = useState(false);

    // ---------- Data Deletion related ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];

            confirm({
                title: getIntlText('common.label.delete'),
                description: getIntlText('device.message.delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                icon: <ErrorIcon sx={{ color: 'var(--orange-base)' }} />,
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        deviceAPI.deleteDevices({ device_id_list: idsToDelete }),
                    );

                    // console.log({ error, resp });
                    if (error || !isRequestSuccess(resp)) return;

                    getDeviceList();
                    setSelectedIds([]);
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getDeviceList, selectedIds],
    );

    // ---------- Table rendering related to ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_ADD}>
                    <Button
                        variant="contained"
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<AddIcon />}
                        onClick={() => setModalOpen(true)}
                    >
                        {getIntlText('common.label.add')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_DELETE}>
                    <Button
                        variant="outlined"
                        color="error"
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
    }, [getIntlText, handleDeleteConfirm, selectedIds]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            // console.log(type, record);
            switch (type) {
                case 'detail': {
                    navigate(`/device/detail/${record.id}`, { state: record });
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
            <div className="ms-view ms-view-device">
                <div className="ms-view__inner">
                    <TablePro<TableRowDataType>
                        checkboxSelection={hasPermission(PERMISSIONS.DEVICE_DELETE)}
                        loading={loading}
                        columns={columns}
                        rows={deviceData?.content}
                        rowCount={deviceData?.total || 0}
                        paginationModel={paginationModel}
                        rowSelectionModel={selectedIds}
                        isRowSelectable={({ row }) => row.deletable}
                        toolbarRender={toolbarRender}
                        onPaginationModelChange={setPaginationModel}
                        onRowSelectionModelChange={setSelectedIds}
                        onRowDoubleClick={({ row }) => {
                            navigate(`/device/detail/${row.id}`, { state: row });
                        }}
                        onSearch={value => {
                            setKeyword(value);
                            setPaginationModel(model => ({ ...model, page: 0 }));
                        }}
                        onRefreshButtonClick={getDeviceList}
                    />
                </div>
            </div>
            <AddModal
                visible={modalOpen}
                onCancel={() => setModalOpen(false)}
                onSuccess={() => {
                    getDeviceList();
                    setModalOpen(false);
                }}
            />
        </div>
    );
};
