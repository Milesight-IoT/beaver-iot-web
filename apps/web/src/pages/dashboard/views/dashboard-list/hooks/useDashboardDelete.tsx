import { useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { InfoIcon, toast } from '@milesight/shared/src/components';

import { useConfirm } from '@/components';
import {
    type DashboardListProps,
    dashboardAPI,
    awaitWrap,
    isRequestSuccess,
} from '@/services/http';

export function useDashboardDelete(refreshDashboards?: () => void) {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();

    const handleDashboardDelete = useMemoizedFn((dashboards: DashboardListProps[]) => {
        confirm({
            title: getIntlText('common.label.delete'),
            icon: <InfoIcon sx={{ color: 'var(--orange-base)' }} />,
            description: getIntlText('dashboard.plugin.trigger_confirm_text'),
            confirmButtonText: getIntlText('common.button.confirm'),
            onConfirm: async () => {
                if (!Array.isArray(dashboards) || isEmpty(dashboards)) {
                    return;
                }

                const [_, res] = await awaitWrap(
                    dashboardAPI.deleteDashboard({
                        dashboard_ids: dashboards.map(d => d.dashboard_id),
                    }),
                );

                if (isRequestSuccess(res)) {
                    refreshDashboards?.();
                    toast.success(getIntlText('common.message.delete_success'));
                }
            },
        });
    });

    return {
        /** Handle delete dashboard */
        handleDashboardDelete,
    };
}
