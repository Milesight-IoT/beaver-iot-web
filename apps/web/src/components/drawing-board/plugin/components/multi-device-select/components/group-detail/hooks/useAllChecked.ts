import { useContext, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty, unionBy, pick } from 'lodash-es';

import { type DeviceDetail } from '@/services/http';
import { MultiDeviceSelectContext } from '../../../context';
import { MAX_COUNT } from '../../../constants';

export function useAllChecked(data?: DeviceDetail[]) {
    const context = useContext(MultiDeviceSelectContext);
    const { locationRequired } = context || {};

    const allIsChecked = useMemo(() => {
        const selected = context?.selectedDevices;
        if (
            !Array.isArray(selected) ||
            isEmpty(selected) ||
            !Array.isArray(data) ||
            isEmpty(data)
        ) {
            return false;
        }

        let includedCount = 0;
        for (const current of data) {
            const isExisted = selected.some(s => s.id === current.id);
            if (isExisted) {
                includedCount += 1;
            }
        }

        return includedCount === data.length;
    }, [context?.selectedDevices, data]);

    const allIsIndeterminate = useMemo(() => {
        const selected = context?.selectedDevices;
        if (
            !Array.isArray(selected) ||
            isEmpty(selected) ||
            !Array.isArray(data) ||
            isEmpty(data)
        ) {
            return false;
        }

        let includedCount = 0;
        for (const current of data) {
            const isExisted = selected.some(s => s.id === current.id);
            if (isExisted) {
                includedCount += 1;
            }
        }

        if (!includedCount || includedCount === data.length) {
            return false;
        }

        return true;
    }, [context?.selectedDevices, data]);

    const allIsDisabled = useMemo(() => {
        if (allIsChecked || allIsIndeterminate) {
            return false;
        }

        const selected = context?.selectedDevices;
        if (
            !Array.isArray(selected) ||
            isEmpty(selected) ||
            !Array.isArray(data) ||
            isEmpty(data)
        ) {
            return false;
        }

        /**
         * If the location is required, and the item has no location, then it is disabled.
         */
        if (locationRequired && !data?.some(d => !!d?.location)) {
            return true;
        }

        /**
         * If the selected devices count plus the data count is greater than the max count, then it is disabled.
         */
        const selectedCount =
            selected.filter(s => {
                const isCurrentData = data.some(d => d.id === s.id);

                return !isCurrentData;
            })?.length || 0;

        return (
            selectedCount +
                data.filter(d => {
                    /**
                     * Filter out the devices that have no location if the location is required.
                     */
                    if (locationRequired && !d?.location) {
                        return false;
                    }

                    return true;
                }).length >
            MAX_COUNT
        );
    }, [context?.selectedDevices, data, allIsIndeterminate, locationRequired, allIsChecked]);

    const handleAllCheckedChange = useMemoizedFn((checked: boolean) => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return;
        }

        if (checked && !allIsIndeterminate) {
            context?.setSelectedDevices(devices => {
                return unionBy(
                    devices,
                    data.filter(d => {
                        /**
                         * Filter out the devices that have no location if the location is required.
                         */
                        if (locationRequired && !d?.location) {
                            return false;
                        }

                        return true;
                    }),
                    'id',
                ).map(d => pick(d, ['id', 'group_id']));
            });
        } else {
            context?.setSelectedDevices(devices => {
                return devices.filter(s => {
                    const isCurrentData = data.some(d => d.id === s.id);

                    return !isCurrentData;
                });
            });
        }
    });

    return {
        allIsChecked,
        allIsIndeterminate,
        allIsDisabled,
        handleAllCheckedChange,
    };
}
