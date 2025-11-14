import { useContext, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty, unionBy, pick } from 'lodash-es';
import { Checkbox } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    UncheckedCheckboxIcon,
    CheckedCheckboxIcon,
    DisabledCheckboxIcon,
    toast,
} from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceGroupItemProps,
} from '@/services/http';
import { FixedGroupEnum } from '@/pages/device/constants';
import { MultiDeviceSelectContext } from '../../context';
import { MAX_COUNT } from '../../constants';
import useMultiDeviceSelectStore from '../../store';

export function useCheckbox() {
    const [devicesLoading, setDevicesLoading] = useState(false);
    const { deviceGroups, updateDeviceGroups } = useMultiDeviceSelectStore();

    const { getIntlText } = useI18n();
    const context = useContext(MultiDeviceSelectContext);
    const { locationRequired } = context || {};

    const isChecked = useMemoizedFn((groupItem: DeviceGroupItemProps) => {
        const devices = context?.selectedDevices;
        if (!Array.isArray(devices) || isEmpty(devices) || !groupItem?.device_count) {
            return false;
        }

        let includedCount = 0;
        if (groupItem?.id === FixedGroupEnum.UNGROUPED) {
            includedCount = devices.filter(d => !d?.group_id).length;
        } else {
            includedCount = devices.filter(d => d.group_id === groupItem.id).length;
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
            includedCount = devices.filter(d => !d?.group_id).length;
        } else {
            includedCount = devices.filter(d => d.group_id === groupItem.id).length;
        }

        if (!includedCount || includedCount === groupItem.device_count) {
            return false;
        }

        return true;
    });

    const isDisabledChecked = useMemoizedFn((groupItem: DeviceGroupItemProps) => {
        if (isIndeterminate(groupItem)) {
            return false;
        }

        let selectedCount = 0;
        if (groupItem?.id === FixedGroupEnum.UNGROUPED) {
            selectedCount = context?.selectedDevices?.filter(d => !!d?.group_id)?.length || 0;
        } else {
            selectedCount =
                context?.selectedDevices?.filter(d => d.group_id !== groupItem.id)?.length || 0;
        }

        const deviceCount = groupItem?.device_count || 0;

        return selectedCount + deviceCount > MAX_COUNT;
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

            /**
             * Filter devices with location required
             */
            const validData = newData.filter(d => {
                if (locationRequired && !d?.location) {
                    return false;
                }
                return true;
            });
            context?.setSelectedDevices(devices => {
                return unionBy(devices, validData, 'id').map(d => pick(d, ['id', 'group_id']));
            });

            if (validData.length !== newData.length) {
                toast.warning(
                    getIntlText('device.tip.plugin_add_failed', {
                        1: newData.length - validData.length,
                    }),
                );
            }
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
                        return (devices || []).filter(item => !!item?.group_id);
                    }

                    return (devices || []).filter(item => item.group_id !== groupItem.id);
                });
            }
        },
    );

    const renderCheckbox = (item: DeviceGroupItemProps) => {
        const disabled = isDisabledChecked(item);

        const CheckboxNode = (
            <Checkbox
                icon={
                    disabled ? (
                        <DisabledCheckboxIcon sx={{ width: '20px', height: '20px' }} />
                    ) : (
                        <UncheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />
                    )
                }
                checkedIcon={<CheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />}
                disabled={disabled}
                indeterminate={isIndeterminate(item)}
                checked={isChecked(item)}
                sx={{
                    padding: 0,
                    color: 'var(--text-color-tertiary)',
                }}
                onChange={(_, checked) => handleCheckedChange(checked, item)}
                onClick={e => {
                    e?.stopPropagation();
                }}
            />
        );

        if (disabled) {
            return (
                <Tooltip title={getIntlText('common.tip.cannot_selected')}>
                    <div>{CheckboxNode}</div>
                </Tooltip>
            );
        }

        return CheckboxNode;
    };

    return {
        devicesLoading,
        isChecked,
        isIndeterminate,
        isDisabledChecked,
        handleCheckedChange,
        renderCheckbox,
    };
}
