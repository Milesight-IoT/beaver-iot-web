import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { useUserStore } from '@/stores';
import {
    type DashboardListProps,
    userAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import useDashboardStore from '@/pages/dashboard/store';

/**
 * Use jump to dashboard drawing board detail
 */
export function useJumpToDetail() {
    const { getIntlText } = useI18n();
    const { userInfo } = useUserStore();
    const navigate = useNavigate();
    const { setPath } = useDashboardStore();

    const [loading, setLoading] = useState(false);

    const handleJumpToDetail = useMemoizedFn(async (item?: DashboardListProps) => {
        try {
            setLoading(true);

            if (!item?.dashboard_id || !item?.main_canvas_id || !userInfo?.user_id) {
                return;
            }

            const [error, resp] = await awaitWrap(
                userAPI.getUserHasResourcePermission({
                    user_id: userInfo.user_id,
                    resource_id: item.dashboard_id,
                    resource_type: 'DASHBOARD',
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);
            const { has_permission: hasPermission } = result || {};
            if (!hasPermission) {
                toast.error(getIntlText('common.label.page_not_permission'));
                return;
            }

            setPath({
                id: item.main_canvas_id,
                name: '',
                attach_id: item.dashboard_id,
                attach_type: 'DASHBOARD',
            });
            navigate(`/dashboard?id=${item.main_canvas_id}`);
        } finally {
            setLoading(false);
        }
    });

    return {
        resourceCheckLoading: loading,
        handleJumpToDetail,
    };
}
