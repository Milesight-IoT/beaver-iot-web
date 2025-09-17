import React, { useState, useMemo, useCallback } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';

import { Button, Stack } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import {
    toast,
    AddIcon,
    RemoveCircleOutlineIcon,
    ErrorIcon,
} from '@milesight/shared/src/components';
import { TablePro, useConfirm } from '@/components';
import { userAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import useUserRoleStore from '@/pages/user-role/store';

import AddDeviceModal from '../add-device-modal';
import TooltipCheckbox from '../tooltip-checkbox';
import { useDevice, useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';

/**
 * Role devices under the role
 */
const Devices: React.FC = () => {
    const { getIntlText } = useI18n();
    const { activeRole } = useUserRoleStore();

    // ---------- Role devices list ----------
    const [keyword, setKeyword] = useState<string>('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    }, []);

    const {
        data: roleDevices,
        loading,
        run: getRoleDevices,
    } = useRequest(
        async () => {
            if (!activeRole) return;

            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                userAPI.getRoleAllDevices({
                    keyword,
                    role_id: activeRole.roleId,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;

            return objectToCamelCase(respData);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel, activeRole],
        },
    );

    // ---------- Role devices remove ----------
    const confirm = useConfirm();
    const handleRemoveConfirm = useMemoizedFn((ids?: ApiKey[]) => {
        const idsToDelete = ids || [...selectedIds];
        if (!Array.isArray(idsToDelete)) return;

        const title = () => {
            if (idsToDelete?.length === 1) {
                return getIntlText('common.label.removal');
            }

            return getIntlText('common.label.bulk_removal');
        };

        const description = () => {
            if (idsToDelete?.length === 1) {
                const selectedDevice = roleDevices?.content?.find(
                    u => u.deviceId === idsToDelete[0],
                );

                return getIntlText('user.role.single_device_remove_tip', {
                    0: selectedDevice?.deviceName || '',
                });
            }

            return getIntlText('user.role.bulk_device_remove_tip', {
                0: idsToDelete.length,
            });
        };

        confirm({
            title: title(),
            description: description(),
            confirmButtonText: getIntlText('common.label.remove'),
            icon: <ErrorIcon sx={{ color: 'var(--orange-base)' }} />,
            onConfirm: async () => {
                if (!activeRole) return;

                const [err, resp] = await awaitWrap(
                    userAPI.removeResourceFromRole({
                        role_id: activeRole.roleId,
                        resources: idsToDelete.map(id => ({
                            id,
                            type: 'DEVICE',
                        })),
                    }),
                );

                if (err || !isRequestSuccess(resp)) {
                    return;
                }

                getRoleDevices();
                toast.success(getIntlText('common.message.remove_success'));
            },
        });
    });

    const { showAddModal, handleModalCancel, addModalVisible, handleModalOk } =
        useDevice(getRoleDevices);

    // ---------- Table render bar ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns md:d-none" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={showAddModal}
                >
                    {getIntlText('common.label.add')}
                </Button>
                <Button
                    variant="outlined"
                    disabled={!selectedIds.length}
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<RemoveCircleOutlineIcon />}
                    onClick={() => handleRemoveConfirm()}
                >
                    {getIntlText('common.label.remove')}
                </Button>
            </Stack>
        );
    }, [getIntlText, handleRemoveConfirm, selectedIds, showAddModal]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useMemoizedFn(
        (type, record) => {
            switch (type) {
                case 'remove': {
                    handleRemoveConfirm([record.deviceId]);
                    break;
                }
                default: {
                    break;
                }
            }
        },
    );

    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });

    return (
        <>
            <TablePro<TableRowDataType>
                filterCondition={[keyword]}
                checkboxSelection
                loading={loading}
                columns={columns}
                getRowId={row => row.deviceId}
                rows={roleDevices?.content}
                rowCount={roleDevices?.total || 0}
                paginationModel={paginationModel}
                rowSelectionModel={selectedIds}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onSearch={handleSearch}
                onRefreshButtonClick={getRoleDevices}
                isRowSelectable={params => Boolean(!params?.row?.roleIntegration)}
                slots={{
                    baseCheckbox: TooltipCheckbox,
                }}
            />
            <AddDeviceModal
                visible={addModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
            />
        </>
    );
};

export default Devices;
