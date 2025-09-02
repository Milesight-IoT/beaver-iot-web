import { useState, useMemo } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { isNil } from 'lodash-es';

import {
    type DashboardDetail,
    dashboardAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import { useDashboardDelete } from './useDashboardDelete';

/**
 * Get Dashboard list
 */
export function useDashboardList() {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState<boolean | undefined>();
    const [selectedDashboard, setSelectedDashboard] = useState<DashboardDetail[]>([]);

    const { data, run: getDashboards } = useRequest(
        async () => {
            try {
                console.log('keyword ? ', keyword);
                setLoading(true);

                const [error, resp] = await awaitWrap(dashboardAPI.getDashboards());
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                const newData = getResponseData(resp);

                /**
                 * Update the selected dashboard data
                 * Remove delete data
                 */
                setSelectedDashboard(items => {
                    const newItems: DashboardDetail[] = [];
                    (items || [])?.forEach(item => {
                        const existedItem = (newData || [])?.find(
                            d => d.dashboard_id === item.dashboard_id,
                        );
                        if (existedItem) {
                            newItems.push(existedItem);
                        }
                    });

                    return newItems;
                });

                return newData;
            } finally {
                setLoading(false);
            }
        },
        {
            refreshDeps: [keyword],
            debounceWait: 300,
        },
    );

    const { handleDashboardDelete } = useDashboardDelete(getDashboards);

    const handleSearch = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e?.target?.value || '');
    });

    const existedHomeDashboard = useMemo(() => {
        return (data || [])?.some(t => Boolean(t.home));
    }, [data]);

    const handleSelectDashboard = useMemoizedFn(
        (e: React.ChangeEvent<HTMLInputElement>, item?: DashboardDetail) => {
            if (!item) return;

            const checked = Boolean(e?.target?.checked);

            if (checked) {
                setSelectedDashboard(items => {
                    return [...items, item];
                });
            } else {
                setSelectedDashboard(items => {
                    const itemIndex = (items || [])?.findIndex(
                        i => i.dashboard_id === item.dashboard_id,
                    );

                    if (!isNil(itemIndex) && itemIndex !== -1) {
                        items.splice(itemIndex, 1);
                    }

                    return [...items];
                });
            }
        },
    );

    const handleBatchDelDashboard = useMemoizedFn(() => {
        handleDashboardDelete(selectedDashboard);
    });

    return {
        /** Loading dashboard list */
        loading,
        /** Dashboard list data */
        data,
        keyword,
        /**
         * Whether existed homeDashboard
         */
        existedHomeDashboard,
        handleSearch,
        /** Refresh newest dashboards */
        getDashboards,
        selectedDashboard,
        /**
         * Handle select dashboard
         */
        handleSelectDashboard,
        /**
         * Handle Batch delete dashboard data
         */
        handleBatchDelDashboard,
    };
}
