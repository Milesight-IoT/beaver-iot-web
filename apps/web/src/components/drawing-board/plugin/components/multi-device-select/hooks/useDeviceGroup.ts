import { useState } from 'react';
import { useRequest } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';

import {
    deviceAPI,
    getResponseData,
    isRequestSuccess,
    type DeviceGroupItemProps,
} from '@/services/http';
import { FixedGroupEnum } from '@/pages/device/constants';
import useMultiDeviceSelectStore from '../store';

/**
 * Handle device group data hook
 */
export function useDeviceGroup() {
    const { getIntlText } = useI18n();
    const { updateDeviceGroups } = useMultiDeviceSelectStore();
    const [loading, setLoading] = useState(false);

    const { run: getDeviceGroups } = useRequest(
        async () => {
            setLoading(true);

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
            ])
                .then(responses => {
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
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        {
            manual: true,
        },
    );

    return {
        loadingGroups: loading,
        getDeviceGroups,
    };
}
