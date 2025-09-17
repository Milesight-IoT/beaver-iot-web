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

import { OperateUserModal } from './components';
import { useUser, useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';

import styles from './style.module.less';

/**
 * Role users under the role
 */
const Users: React.FC = () => {
    const { getIntlText } = useI18n();

    // ---------- Role users list ----------
    const [keyword, setKeyword] = useState<string>('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    }, []);

    const {
        data: allUsers,
        loading,
        run: getAllUsers,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                userAPI.getAllUsers({
                    keyword,
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
            refreshDeps: [keyword, paginationModel],
        },
    );

    // ---------- Role users remove ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useMemoizedFn((ids?: ApiKey[]) => {
        const idsToDelete = ids || [...selectedIds];
        if (!Array.isArray(idsToDelete)) return;

        const title = () => {
            if (idsToDelete?.length === 1) {
                return getIntlText('common.label.deletion');
            }

            return getIntlText('common.label.bulk_deletion');
        };

        const description = () => {
            if (idsToDelete?.length === 1) {
                const selectedUser = allUsers?.content?.find(u => u.userId === idsToDelete[0]);

                return getIntlText('user.label.single_delete_tip', {
                    0: selectedUser?.nickname || '',
                });
            }

            return getIntlText('user.label.bulk_delete_tip', {
                0: idsToDelete.length,
            });
        };

        confirm({
            title: title(),
            description: description(),
            confirmButtonText: getIntlText('common.label.delete'),
            icon: <ErrorIcon sx={{ color: 'var(--orange-base)' }} />,
            onConfirm: async () => {
                const [err, resp] = await awaitWrap(
                    userAPI.deleteUsers({
                        user_id_list: idsToDelete,
                    }),
                );

                if (err || !isRequestSuccess(resp)) {
                    return;
                }

                getAllUsers();
                toast.success(getIntlText('common.message.delete_success'));
            },
        });
    });

    const {
        showUserModal,
        handleModalCancel,
        userModalVisible,
        handleUserFormSubmit,
        operateModalType,
        modalTitle,
        setEditUserInfo,
        editModalData,
    } = useUser(getAllUsers);

    // ---------- Table render bar ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    className="md:d-none"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={() => showUserModal('add')}
                >
                    {getIntlText('common.label.add')}
                </Button>
                <Button
                    variant="outlined"
                    className="md:d-none"
                    disabled={!selectedIds.length}
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<RemoveCircleOutlineIcon />}
                    onClick={() => handleDeleteConfirm()}
                >
                    {getIntlText('common.label.delete')}
                </Button>
            </Stack>
        );
    }, [getIntlText, handleDeleteConfirm, selectedIds, showUserModal]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useMemoizedFn(
        (type, record) => {
            switch (type) {
                case 'resetPassword': {
                    showUserModal('resetPassword');
                    setEditUserInfo(record);
                    break;
                }
                case 'edit': {
                    showUserModal('edit');
                    setEditUserInfo(record);
                    break;
                }
                case 'delete': {
                    handleDeleteConfirm([record.userId]);
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
        <div className={styles['users-container']}>
            <TablePro<TableRowDataType>
                filterCondition={[keyword]}
                checkboxSelection
                loading={loading}
                columns={columns}
                getRowId={row => row.userId}
                rows={allUsers?.content}
                rowCount={allUsers?.total || 0}
                paginationModel={paginationModel}
                rowSelectionModel={selectedIds}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onSearch={handleSearch}
                onRefreshButtonClick={getAllUsers}
            />
            <OperateUserModal
                operateType={operateModalType}
                title={modalTitle}
                visible={userModalVisible}
                onCancel={handleModalCancel}
                onSuccess={operateType => {
                    operateType !== 'add' && setSelectedIds([]);
                }}
                onFormSubmit={handleUserFormSubmit}
                data={editModalData}
            />
        </div>
    );
};

export default Users;
