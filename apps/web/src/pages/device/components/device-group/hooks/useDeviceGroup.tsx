import { useState } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast, ErrorIcon } from '@milesight/shared/src/components';

import { useConfirm } from '@/components';
import {
    type DeviceGroupItemProps,
    awaitWrap,
    deviceAPI,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import useDeviceStore from '@/pages/device/store';
import { FIXED_GROUP } from '@/pages/device/constants';

/**
 * Handle device group many operation
 */
export function useDeviceGroup(getDeviceGroupCount: () => void, refreshDeviceList?: () => void) {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const { activeGroup, updateActiveGroup, updateDeviceGroups } = useDeviceStore();

    const [keyword, setKeyword] = useState('');

    const changeKeyword = useMemoizedFn((keyword: string) => {
        setKeyword(keyword);
    });

    const {
        run: getDeviceGroups,
        data: deviceGroups,
        loading,
    } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(
                deviceAPI.getDeviceGroupList({
                    page_number: 1,
                    page_size: 100,
                    name: keyword,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const data = getResponseData(resp)?.content || [];
            updateDeviceGroups(data);

            return data;
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword],
        },
    );

    const handleGroupDelete = useMemoizedFn((record: DeviceGroupItemProps) => {
        if (!record) return;

        confirm({
            title: getIntlText('common.label.delete'),
            description: getIntlText('device.tip.delete_device_group', {
                1: record.name,
            }),
            confirmButtonText: getIntlText('common.label.delete'),
            icon: <ErrorIcon sx={{ color: 'var(--orange-base)' }} />,
            onConfirm: async () => {
                if (!record?.id) return;

                const [error, resp] = await awaitWrap(
                    deviceAPI.deleteDeviceGroup({
                        id: record.id,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                /**
                 * If the active group is deleted, the first group
                 * will be selected by default
                 */
                if (record.id === activeGroup?.id) {
                    updateActiveGroup({
                        id: FIXED_GROUP[0].id,
                        name: getIntlText(FIXED_GROUP[0].name),
                    });
                }

                getDeviceGroups?.();
                getDeviceGroupCount?.();
                refreshDeviceList?.();
                toast.success(getIntlText('common.message.delete_success'));
            },
        });
    });

    return {
        loading,
        deviceGroups,
        keyword,
        changeKeyword,
        getDeviceGroups,
        handleGroupDelete,
    };
}
