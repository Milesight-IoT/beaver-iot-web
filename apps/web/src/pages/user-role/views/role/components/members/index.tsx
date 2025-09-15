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

import { AddMemberModal } from './components';
import { useMembers, useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';

/**
 * User members under the role
 */
const Members: React.FC = () => {
    const { getIntlText } = useI18n();
    const { activeRole } = useUserRoleStore();

    // ---------- user member list ----------
    const [keyword, setKeyword] = useState<string>('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);

    const {
        data: userMembers,
        loading,
        run: getUserMembers,
    } = useRequest(
        async () => {
            if (!activeRole) return;

            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                userAPI.getRoleAllUsers({
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

    // ---------- user members remove ----------
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
                const selectedMember = userMembers?.content?.find(u => u.userId === idsToDelete[0]);

                return getIntlText('user.role.single_member_remove_tip', {
                    0: selectedMember?.userNickname || '',
                });
            }

            return getIntlText('user.role.bulk_member_remove_tip', {
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
                    userAPI.removeUsersFromRole({
                        role_id: activeRole.roleId,
                        user_ids: idsToDelete,
                    }),
                );

                if (err || !isRequestSuccess(resp)) {
                    return;
                }

                getUserMembers();
                toast.success(getIntlText('common.message.remove_success'));
            },
        });
    });

    const { showAddModal, handleModalCancel, addModalVisible, handleModalOk } =
        useMembers(getUserMembers);

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
                    handleRemoveConfirm([record.userId]);
                    break;
                }
                default: {
                    break;
                }
            }
        },
    );

    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });
    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    }, []);

    return (
        <>
            <TablePro<TableRowDataType>
                filterCondition={[keyword]}
                checkboxSelection
                loading={loading}
                columns={columns}
                getRowId={row => row.userId}
                rows={userMembers?.content}
                rowCount={userMembers?.total || 0}
                paginationModel={paginationModel}
                rowSelectionModel={selectedIds}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onSearch={handleSearch}
                onRefreshButtonClick={getUserMembers}
            />
            <AddMemberModal
                visible={addModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
            />
        </>
    );
};

export default Members;
