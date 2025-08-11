import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { deviceAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { GroupTabEnums, type ChangeGroupProps } from '../components/change-group-modal';

export type OperateModalType = 'add' | 'edit';

export default function useGroupModal(getDevices?: () => void) {
    const { getIntlText } = useI18n();

    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState<ApiKey[]>([]);
    const [currentTab, setCurrentTab] = useState<GroupTabEnums>(GroupTabEnums.GROUP);

    const openGroupModal = useMemoizedFn(() => {
        setGroupModalVisible(true);
        setCurrentTab(GroupTabEnums.GROUP);
    });

    const hiddenGroupModal = useMemoizedFn(() => {
        setGroupModalVisible(false);
    });

    const handleChangeTab = useMemoizedFn((tab: GroupTabEnums) => {
        setCurrentTab(tab);
    });

    /**
     * Change the group to which a single device belongs
     */
    const singleChangeGroupModal = useMemoizedFn((device: ApiKey) => {
        openGroupModal();
        setSelectedDevices([device]);
    });

    /**
     * Bulk change the group to which a device belongs
     */
    const batchChangeGroupModal = useMemoizedFn((devices: ApiKey[]) => {
        openGroupModal();
        setSelectedDevices(devices);
    });

    const changeGroupFormSubmit = useMemoizedFn(
        async (data: ChangeGroupProps, callback: () => void) => {
            if (!Array.isArray(selectedDevices) || isEmpty(selectedDevices)) return;

            const [error, resp] = await awaitWrap(
                deviceAPI.moveDeviceToGroup({
                    group_id: currentTab === GroupTabEnums.GROUP ? data?.group : undefined,
                    device_id_list: selectedDevices,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            getDevices?.();
            callback?.();
            setGroupModalVisible(false);
            toast.success(getIntlText('common.message.operation_success'));
        },
    );

    return {
        selectedDevices,
        groupModalVisible,
        currentTab,
        handleChangeTab,
        singleChangeGroupModal,
        batchChangeGroupModal,
        hiddenGroupModal,
        changeGroupFormSubmit,
    };
}
