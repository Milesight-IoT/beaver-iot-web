import { useContext, useState } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isEmpty, pick, unionBy } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';

import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceGroupItemProps,
} from '@/services/http';
import { FixedGroupEnum } from '@/pages/device/constants';
import useMultiDeviceSelectStore from '../../store';
import { MultiDeviceSelectContext } from '../../context';
import { MAX_COUNT } from '../../constants';

/**
 * Handle device group data hook
 */
export function useDeviceGroup() {
    const { getIntlText } = useI18n();
    const { deviceGroups, updateDeviceGroups } = useMultiDeviceSelectStore();
    const context = useContext(MultiDeviceSelectContext);

    const [devicesLoading, setDevicesLoading] = useState(false);

    useRequest(async () => {
        Promise.all([
            deviceAPI.getList({
                page_number: 1,
                page_size: 1,
                filter_not_grouped: true,
            }),
            deviceAPI.getDeviceGroupList({
                page_number: 1,
                page_size: 100,
                with_device_count: true,
            }),
        ]).then(responses => {
            const [resp1, resp2] = responses || [];
            if (!isRequestSuccess(resp1) || !isRequestSuccess(resp2)) {
                return;
            }

            const data1 = getResponseData(resp1);
            const data2 = getResponseData(resp2);
            const ungroupedDevices: DeviceGroupItemProps[] = data1?.total
                ? [
                      {
                          name: getIntlText('device.label.ungrouped_devices'),
                          id: FixedGroupEnum.UNGROUPED,
                          device_count: data1.total,
                      },
                  ]
                : [];
            const groups = (data2?.content || []).filter(d2 => !!d2?.device_count);

            updateDeviceGroups([...ungroupedDevices, ...groups]);
        });
    });

    const isChecked = useMemoizedFn((groupItem: DeviceGroupItemProps) => {
        const devices = context?.selectedDevices;
        if (!Array.isArray(devices) || isEmpty(devices) || !groupItem?.device_count) {
            return false;
        }

        let includedCount = 0;
        if (groupItem?.id === FixedGroupEnum.UNGROUPED) {
            includedCount = devices.filter(d => !d?.group_name).length;
        } else {
            includedCount = devices.filter(d => d.group_name === groupItem.name).length;
        }

        return includedCount === groupItem.device_count;
    });

    const isIndeterminate = useMemoizedFn((groupItem: DeviceGroupItemProps) => {
        const devices = context?.selectedDevices;
        if (!Array.isArray(devices) || isEmpty(devices) || !groupItem?.device_count) {
            return false;
        }
        let includedCount = 0;
        if (groupItem?.id === FixedGroupEnum.UNGROUPED) {
            includedCount = devices.filter(d => !d?.group_name).length;
        } else {
            includedCount = devices.filter(d => d.group_name === groupItem.name).length;
        }

        if (!includedCount || includedCount === groupItem.device_count) {
            return false;
        }

        return true;
    });

    const isDisabledChecked = useMemoizedFn((groupItem: DeviceGroupItemProps) => {
        let selectedCount = 0;
        if (groupItem?.id === FixedGroupEnum.UNGROUPED) {
            selectedCount = context?.selectedDevices?.filter(d => !!d?.group_name)?.length || 0;
        } else {
            selectedCount =
                context?.selectedDevices?.filter(d => d.group_name !== groupItem.name)?.length || 0;
        }

        const deviceCount = groupItem?.device_count || 0;

        return selectedCount + deviceCount >= MAX_COUNT;
    });

    const getGroupDevices = useMemoizedFn(async (groupItem: DeviceGroupItemProps) => {
        try {
            setDevicesLoading(true);

            const { id, device_count: count } = groupItem || {};

            if (!id || !count) {
                return;
            }

            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    group_id: id === FixedGroupEnum.UNGROUPED ? undefined : id,
                    page_number: 1,
                    page_size: count,
                    filter_not_grouped: id === FixedGroupEnum.UNGROUPED,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const data = getResponseData(resp);

            const newData = data?.content || [];
            if (!Array.isArray(newData) || isEmpty(newData)) {
                return;
            }

            /**
             * Update device group device count
             */
            updateDeviceGroups(
                deviceGroups.map(group => {
                    if (group.id === groupItem.id && data?.total) {
                        return {
                            ...group,
                            device_count: data?.total,
                        };
                    }

                    return group;
                }),
            );

            context?.setSelectedDevices(devices => {
                return unionBy(devices, newData, 'key').map(d => pick(d, ['id', 'group_name']));
            });
        } finally {
            setDevicesLoading(false);
        }
    });

    const handleCheckedChange = useMemoizedFn(
        (checked: boolean, groupItem: DeviceGroupItemProps) => {
            const indeterminate = isIndeterminate(groupItem);

            if (checked && !indeterminate) {
                getGroupDevices(groupItem);
            } else {
                context?.setSelectedDevices(devices => {
                    if (groupItem?.id === FixedGroupEnum.UNGROUPED) {
                        return (devices || []).filter(item => !!item?.group_name);
                    }

                    return (devices || []).filter(item => item.group_name !== groupItem.name);
                });
            }
        },
    );

    return {
        devicesLoading,
        deviceGroups,
        isDisabledChecked,
        isChecked,
        isIndeterminate,
        handleCheckedChange,
    };
}
