import React, { useState, useEffect } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps, toast } from '@milesight/shared/src/components';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';

import { userAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import useUserRoleStore from '@/pages/user-role/store';
import { TableTransfer } from '@/components';
import { type TableRowDataType, useColumns } from './hooks';

/**
 * add device modal
 */
const AddDeviceModal: React.FC<ModalProps> = props => {
    const { visible, onOk, ...restProps } = props;

    const { activeRole } = useUserRoleStore();
    const { getIntlText } = useI18n();
    const columns = useColumns();

    const [keyword, setKeyword] = useState<string>('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortType, setSortType] = useState<SortType>('DESC');
    const [chosenDevices, setChosenDevices] = useState<TableRowDataType[]>([]);

    const {
        run: getUndistributedDevices,
        data: undistributedDevices,
        loading,
    } = useRequest(
        async () => {
            if (!activeRole || !visible) return;

            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                userAPI.getRoleUndistributedDevices({
                    keyword,
                    sorts: [
                        {
                            property: 'created_at',
                            direction: sortType,
                        },
                    ],
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
            refreshDeps: [keyword, paginationModel, sortType, activeRole, visible],
        },
    );

    /**
     *  initial data
     */
    useEffect(() => {
        if (!visible) {
            setKeyword('');
            setChosenDevices([]);
            setPaginationModel({ page: 0, pageSize: 10 });
        }
    }, [visible]);

    const handleOk = useMemoizedFn(async () => {
        if (!Array.isArray(chosenDevices) || isEmpty(chosenDevices)) {
            toast.info(getIntlText('common.placeholder.select'));
            return;
        }

        /**
         * distribute Users To the Role
         */
        if (!activeRole) return;
        const [err, resp] = await awaitWrap(
            userAPI.distributeResourcesToRole({
                role_id: activeRole.roleId,
                resources: chosenDevices.map(d => ({
                    id: d.deviceId,
                    type: 'DEVICE',
                })),
            }),
        );

        if (err || !isRequestSuccess(resp)) {
            return;
        }

        onOk?.();
        toast.success(getIntlText('common.message.add_success'));
    });

    /**
     * right table selected items filter method
     */
    const handleSelectedFilter = useMemoizedFn((keyword, row: TableRowDataType) => {
        const newKeyword = (keyword || '')?.toLowerCase();

        return (
            row.deviceName?.toLowerCase()?.includes(newKeyword) ||
            row.userNickname?.toLowerCase()?.includes(newKeyword) ||
            row.integrationName?.toLowerCase()?.includes(newKeyword)
        );
    });

    /** left table search */
    const handleSearch = useMemoizedFn((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    });

    const renderModal = () => {
        if (visible) {
            return (
                <Modal
                    width="1200px"
                    visible={visible}
                    title={getIntlText('user.role.device_permission_modal_title')}
                    sx={{
                        '& .MuiDialogContent-root': {
                            display: 'flex',
                        },
                    }}
                    onOk={handleOk}
                    {...restProps}
                >
                    <TableTransfer<TableRowDataType>
                        showTimeSort
                        onChange={setChosenDevices}
                        selectedFilter={handleSelectedFilter}
                        sortField="createdAt"
                        onTimeSort={setSortType}
                        tableProps={{
                            loading,
                            rows: undistributedDevices?.content,
                            rowCount: undistributedDevices?.total || 0,
                            columns,
                            getRowId: row => row.deviceId,
                            paginationModel,
                            onPaginationModelChange: setPaginationModel,
                            onSearch: handleSearch,
                            onRefreshButtonClick: getUndistributedDevices,
                        }}
                    />
                </Modal>
            );
        }

        return null;
    };

    return renderModal();
};

export default AddDeviceModal;
