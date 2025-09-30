import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import classNames from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import {
    AddIcon,
    DeleteOutlineIcon,
    toast,
    ErrorIcon,
    DriveFileMoveOutlinedIcon,
} from '@milesight/shared/src/components';
import {
    Breadcrumbs,
    TablePro,
    useConfirm,
    PermissionControlHidden,
    Tooltip,
    type FiltersRecordType,
    type TableProProps,
    type FilterValue,
} from '@/components';
import { PERMISSIONS } from '@/constants';
import { useUserPermissions } from '@/hooks';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import {
    useColumns,
    type UseColumnsProps,
    type TableRowDataType,
    useDevice,
    useChangeGroup,
    useBatchAddModal,
} from './hooks';
import { AddModal, DeviceGroup, Shrink, ChangeGroupModal, BatchAddModal } from './components';
import useDeviceStore from './store';
import { FixedGroupEnum } from './constants';
import './style.less';

export default () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();
    const { activeGroup } = useDeviceStore();

    const queryParams = new URLSearchParams(location.search);
    const templateKey = queryParams.get('template_key');

    // ---------- list data related to ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});

    const filterGroupParams = useMemo(() => {
        if (!activeGroup?.id || activeGroup.id === FixedGroupEnum.ALL) return {};

        if (activeGroup.id === FixedGroupEnum.UNGROUPED) {
            return {
                filter_not_grouped: true,
            };
        }

        return {
            group_id: activeGroup.id,
        };
    }, [activeGroup]);

    useEffect(() => {
        setSelectedIds([]);
        setPaginationModel({ page: 0, pageSize: 10 });
    }, [activeGroup]);

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
                    template: templateKey as string,
                    identifier: Reflect.get(filteredInfo, 'identifier')?.[0] as string | undefined,
                    ...filterGroupParams,
                }),
            );
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;

            // Refresh selectedIds to render the checkbox in header row
            setSelectedIds(ids => [...ids]);
            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel, templateKey, filterGroupParams, filteredInfo],
        },
    );

    const { isShrink, toggleShrink, activeGroupName, deviceGroupRef } = useDevice();
    const {
        selectedDevices,
        groupModalVisible,
        currentTab,
        handleChangeTab,
        hiddenGroupModal,
        changeGroupFormSubmit,
        singleChangeGroupModal,
        batchChangeGroupModal,
    } = useChangeGroup(getDeviceList);
    const {
        batchAddModalVisible,
        batchAddStatus,
        addList,
        integration,
        templateFile,
        rowIds,
        hiddenBatchGroupModal,
        batchAddFormSubmit,
        openBatchGroupModal,
    } = useBatchAddModal(deviceGroupRef, getDeviceList);

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

                    if (error || !isRequestSuccess(resp)) return;

                    getDeviceList();
                    setSelectedIds(selectedIds => {
                        return selectedIds.filter(id => !idsToDelete.includes(id));
                    });

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
                        className="md:d-none"
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<AddIcon />}
                        onClick={() => setModalOpen(true)}
                    >
                        {getIntlText('common.label.add')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_ADD}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<AddIcon />}
                        onClick={openBatchGroupModal}
                    >
                        {getIntlText('common.label.batch_add')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_EDIT}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        disabled={!selectedIds.length}
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<DriveFileMoveOutlinedIcon />}
                        onClick={() => batchChangeGroupModal(selectedIds as ApiKey[])}
                    >
                        {getIntlText('device.label.change_device_group')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_DELETE}>
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
    }, [getIntlText, handleDeleteConfirm, selectedIds, batchChangeGroupModal, openBatchGroupModal]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            // console.log(type, record);
            switch (type) {
                case 'detail': {
                    navigate(`/device/detail/${record.id}`, { state: record });
                    break;
                }
                case 'changeGroup': {
                    singleChangeGroupModal(record.id);
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
        [navigate, handleDeleteConfirm, singleChangeGroupModal],
    );
    const columns = useColumns<TableRowDataType>({
        onButtonClick: handleTableBtnClick,
        filteredInfo,
    });

    const handleFilterChange: TableProProps<TableRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    const deviceViewCls = useMemo(() => {
        return classNames('ms-view__inner', {
            shrink: isShrink,
        });
    }, [isShrink]);

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-device">
                <div className={deviceViewCls}>
                    <DeviceGroup
                        ref={deviceGroupRef}
                        isShrink={isShrink}
                        refreshDeviceList={getDeviceList}
                    />

                    <div className="device-right">
                        <div className="device-right__title">
                            <Tooltip autoEllipsis title={activeGroupName} />
                        </div>
                        <TablePro<TableRowDataType>
                            keepNonExistentRowsSelected
                            filterCondition={[keyword]}
                            checkboxSelection={hasPermission([
                                PERMISSIONS.DEVICE_DELETE,
                                PERMISSIONS.DEVICE_EDIT,
                            ])}
                            loading={loading}
                            columns={columns}
                            rows={deviceData?.content}
                            rowCount={deviceData?.total || 0}
                            paginationModel={paginationModel}
                            pageSizeOptions={[10, 20, 30, 40, 50, 100]}
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
                            onFilterInfoChange={handleFilterChange}
                        />
                        <Shrink isShrink={isShrink} toggleShrink={toggleShrink} />
                    </div>
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
            {groupModalVisible && (
                <ChangeGroupModal
                    visible={groupModalVisible}
                    selectedIds={selectedDevices}
                    currentTab={currentTab}
                    handleChangeTab={handleChangeTab}
                    onCancel={hiddenGroupModal}
                    onSuccess={() => {
                        setSelectedIds([]);
                    }}
                    onFormSubmit={changeGroupFormSubmit}
                />
            )}
            {batchAddModalVisible && (
                <BatchAddModal
                    visible={batchAddModalVisible}
                    status={batchAddStatus}
                    addList={addList}
                    integration={integration}
                    templateFile={templateFile}
                    rowIds={rowIds}
                    onCancel={hiddenBatchGroupModal}
                    onFormSubmit={batchAddFormSubmit}
                />
            )}
        </div>
    );
};
