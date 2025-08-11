import { useMemo, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';

import {
    FolderOpenOutlinedIcon,
    DashboardIcon,
    HelpOutlinedIcon,
} from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { FIXED_GROUP, FixedGroupEnum } from '@/pages/device/constants';
import useDeviceStore from '@/pages/device/store';
import { type DeviceGroupItemProps } from '@/services/http/device';

export function useBody(deviceGroups?: DeviceGroupItemProps[]) {
    const { activeGroup, updateActiveGroup } = useDeviceStore();
    const { getIntlText } = useI18n();

    useEffect(() => {
        if (activeGroup) {
            return;
        }

        updateActiveGroup({
            id: FIXED_GROUP[0].id,
            name: getIntlText(FIXED_GROUP[0].name),
        });
    }, [activeGroup, getIntlText, updateActiveGroup]);

    const data: DeviceGroupItemProps[] = useMemo(
        () => [
            ...FIXED_GROUP.map(item => ({ id: item.id, name: getIntlText(item.name) })),
            ...(deviceGroups || []),
        ],
        [deviceGroups, getIntlText],
    );

    const handleGroupClick = useMemoizedFn((item: DeviceGroupItemProps) => {
        updateActiveGroup(item);
    });

    const hiddenMore = useMemoizedFn((id: ApiKey) => {
        return ([FixedGroupEnum.ALL, FixedGroupEnum.UNGROUPED] as ApiKey[]).includes(id);
    });

    const groupItemIcon = useMemoizedFn((id: ApiKey) => {
        if (id === FixedGroupEnum.ALL) {
            return <DashboardIcon color="action" />;
        }

        if (id === FixedGroupEnum.UNGROUPED) {
            return <HelpOutlinedIcon color="action" />;
        }

        return <FolderOpenOutlinedIcon color="action" />;
    });

    return {
        data,
        /** Current selected group */
        activeGroup,
        handleGroupClick,
        /** Whether to hidden the more dropdown */
        hiddenMore,
        groupItemIcon,
    };
}
