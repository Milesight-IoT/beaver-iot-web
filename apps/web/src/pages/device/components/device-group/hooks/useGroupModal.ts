import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { type DeviceGroupItemProps, deviceAPI, isRequestSuccess, awaitWrap } from '@/services/http';
import useDeviceStore from '@/pages/device/store';
import { type OperateGroupProps } from '../components/operate-group-modal';

export type OperateModalType = 'add' | 'edit';

export function useGroupModal(props: {
    getDeviceGroups?: () => void;
    getDeviceGroupCount?: () => void;
    refreshDeviceList?: () => void;
}) {
    const { getDeviceGroups, getDeviceGroupCount, refreshDeviceList } = props || {};

    const { getIntlText } = useI18n();
    const { activeGroup, updateActiveGroup } = useDeviceStore();

    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [groupModalTitle, setGroupModalTitle] = useState(
        getIntlText('device.label.add_device_group'),
    );
    const [operateType, setOperateType] = useState<OperateModalType>('add');
    const [currentGroup, setCurrentGroup] = useState<DeviceGroupItemProps>();

    const hiddenGroupModal = useMemoizedFn(() => {
        setGroupModalVisible(false);
    });

    const addGroupModal = useMemoizedFn(() => {
        setGroupModalVisible(true);
        setGroupModalTitle(getIntlText('device.label.add_device_group'));
        setOperateType('add');
        setCurrentGroup(undefined);
    });

    const editGroupModal = useMemoizedFn((record?: DeviceGroupItemProps) => {
        setGroupModalVisible(true);
        setGroupModalTitle(getIntlText('device.label.edit_device_group'));
        setOperateType('edit');
        setCurrentGroup(record);
    });

    const handleAddGroup = useMemoizedFn(async (data: OperateGroupProps, callback: () => void) => {
        const [error, resp] = await awaitWrap(deviceAPI.addDeviceGroup(data));
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        getDeviceGroups?.();
        getDeviceGroupCount?.();
        setGroupModalVisible(false);
        toast.success(getIntlText('common.message.add_success'));
        callback?.();
    });

    const handleEditGroup = useMemoizedFn(async (data: OperateGroupProps, callback: () => void) => {
        if (!currentGroup?.id) return;

        const [error, resp] = await awaitWrap(
            deviceAPI.updateDeviceGroup({
                id: currentGroup.id,
                ...data,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        /**
         * Edit group name is completed
         * update active group basic info
         */
        if (activeGroup?.id && data.name && currentGroup.id === activeGroup.id) {
            updateActiveGroup({
                ...activeGroup,
                name: data.name,
            });
        }

        getDeviceGroups?.();
        refreshDeviceList?.();
        setGroupModalVisible(false);
        toast.success(getIntlText('common.message.operation_success'));
        callback?.();
    });

    const onFormSubmit = useMemoizedFn(async (data: OperateGroupProps, callback: () => void) => {
        if (!data) return;

        if (operateType === 'add') {
            await handleAddGroup(data, callback);
            return;
        }

        await handleEditGroup(data, callback);
    });

    return {
        groupModalVisible,
        groupModalTitle,
        currentGroup,
        addGroupModal,
        editGroupModal,
        hiddenGroupModal,
        onFormSubmit,
    };
}
