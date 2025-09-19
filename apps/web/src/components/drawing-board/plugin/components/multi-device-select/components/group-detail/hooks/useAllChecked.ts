import { useContext, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty, unionBy, pick } from 'lodash-es';

import { type DeviceDetail } from '@/services/http';
import { MultiDeviceSelectContext } from '../../../context';
import { MAX_COUNT } from '../../../constants';

export function useAllChecked(data?: DeviceDetail[]) {
    const context = useContext(MultiDeviceSelectContext);

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
        const selected = context?.selectedDevices;
        if (
            !Array.isArray(selected) ||
            isEmpty(selected) ||
            !Array.isArray(data) ||
            isEmpty(data)
        ) {
            return false;
        }

        const selectedCount =
            selected.filter(s => {
                const isCurrentData = data.some(d => d.id === s.id);

                return !isCurrentData;
            })?.length || 0;

        return selectedCount + data.length >= MAX_COUNT;
    }, [context?.selectedDevices, data]);

    const handleAllCheckedChange = useMemoizedFn((checked: boolean) => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return;
        }

        if (checked && !allIsIndeterminate) {
            context?.setSelectedDevices(devices => {
                return unionBy(devices, data, 'id').map(d => pick(d, ['id', 'group_id']));
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
