import { useContext } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty, unionBy, pick } from 'lodash-es';

import { type DeviceDetail } from '@/services/http';
import { MultiDeviceSelectContext } from '../../../context';
import { MAX_COUNT } from '../../../constants';

export function useSingleChecked() {
    const context = useContext(MultiDeviceSelectContext);
    const { locationRequired } = context || {};

    const isChecked = useMemoizedFn((item: DeviceDetail) => {
        const selected = context?.selectedDevices;
        if (!Array.isArray(selected) || isEmpty(selected)) {
            return false;
        }

        return selected.some(s => s.id === item.id);
    });

    const isDisabled = useMemoizedFn((item: DeviceDetail) => {
        if (isChecked(item)) {
            return false;
        }

        /**
         * If the location is required, and the item has no location, then it is disabled.
         */
        if (locationRequired && !item?.location) {
            return true;
        }

        const selected = context?.selectedDevices;
        if (!Array.isArray(selected) || isEmpty(selected)) {
            return false;
        }

        const selectedCount = selected.filter(s => s.id !== item.id);
        return selectedCount.length >= MAX_COUNT;
    });

    const handleCheckedChange = useMemoizedFn((checked: boolean, item: DeviceDetail) => {
        if (checked) {
            context?.setSelectedDevices(devices => {
                return unionBy(devices, [item], 'id').map(d => pick(d, ['id', 'group_id']));
            });
        } else {
            context?.setSelectedDevices(devices => {
                return devices.filter(s => s.id !== item.id);
            });
        }
    });

    return {
        isChecked,
        isDisabled,
        handleCheckedChange,
    };
}
