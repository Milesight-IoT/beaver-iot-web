import { useMemo, useState, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';

import useDeviceStore from '../store';
import { type DeviceGroupExposeProps } from '../components/device-group';
import { FIXED_GROUP } from '../constants';

export default function useDevice() {
    const { activeGroup } = useDeviceStore();
    const { getIntlText } = useI18n();

    const [isShrink, setIsShrink] = useState(false);

    const deviceGroupRef = useRef<DeviceGroupExposeProps>(null);

    const activeGroupName = useMemo(() => {
        if (!activeGroup) return '';

        const fixedGroup = FIXED_GROUP.find(f => f.id === activeGroup.id);
        if (fixedGroup) {
            return getIntlText(fixedGroup.name);
        }

        return activeGroup?.name || '';
    }, [activeGroup, getIntlText]);

    const toggleShrink = useMemoizedFn(() => {
        setIsShrink(!isShrink);
    });

    return {
        /**
         * Whether to shrink the device group
         */
        isShrink,
        /**
         * The current active group name
         */
        activeGroupName,
        /**
         * toggle the device group shrink status
         */
        deviceGroupRef,
        toggleShrink,
    };
}
