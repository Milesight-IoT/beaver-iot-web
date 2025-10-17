import { useState } from 'react';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';

import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { FixedGroupEnum } from '@/pages/device/constants';
import useMultiDeviceSelectStore from '../store';
import { DEVICES_PAGE_SIZE } from '../constants';

export function useDeviceData(keyword: string) {
    const { selectedGroup, deviceGroups, updateDeviceGroups } = useMultiDeviceSelectStore();
    const [loading, setLoading] = useState(false);

    const [pageCount, setPageCount] = useState(1);
    const [pageNum, setPageNum] = useState(1);

    const { data: deviceList, run: getDeviceList } = useRequest(
        async () => {
            try {
                setLoading(true);

                if (!selectedGroup?.id && !keyword) {
                    return;
                }

                const [error, resp] = await awaitWrap(
                    deviceAPI.getList({
                        name: keyword,
                        group_id:
                            FixedGroupEnum.UNGROUPED === selectedGroup?.id
                                ? undefined
                                : selectedGroup?.id,
                        filter_not_grouped: FixedGroupEnum.UNGROUPED === selectedGroup?.id,
                        page_number: pageNum,
                        page_size: DEVICES_PAGE_SIZE,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                const data = getResponseData(resp);

                setPageCount(Math.ceil((data?.total || 0) / DEVICES_PAGE_SIZE) || 1);

                /**
                 * Update device group device count
                 */
                if (selectedGroup?.id) {
                    updateDeviceGroups(
                        deviceGroups.map(group => {
                            if (group.id === selectedGroup.id && !isNil(data?.total)) {
                                return {
                                    ...group,
                                    device_count: data?.total,
                                };
                            }

                            return group;
                        }),
                    );
                }

                return data?.content || [];
            } finally {
                setLoading(false);
            }
        },
        {
            debounceWait: 300,
            refreshDeps: [selectedGroup, keyword, pageNum],
        },
    );

    return {
        deviceList,
        loadingDevices: loading,
        pageCount,
        setPageNum,
        getDeviceList,
    };
}
