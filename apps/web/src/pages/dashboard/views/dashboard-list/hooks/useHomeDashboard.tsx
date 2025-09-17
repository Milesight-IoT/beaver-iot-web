import { useMemo, useState, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { StarOutlinedIcon, StarIcon, ErrorIcon, toast } from '@milesight/shared/src/components';

import { type DashboardListProps } from '@/services/http';
import { dashboardAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { useConfirm } from '@/components';

/**
 * Set or unset the home dashboard
 */
export function useHomeDashboard(props: {
    /**
     * Existence of homeDashboard
     */
    existedHomeDashboard?: boolean;
    dashboardItem?: DashboardListProps;
    refreshDashboards?: () => void;
}) {
    const { existedHomeDashboard, dashboardItem, refreshDashboards } = props || {};

    const { getIntlText } = useI18n();
    const confirm = useConfirm();

    /**
     * whether the current dashboard the home dashboard
     */
    const [isHome, setIsHome] = useState(false);
    const [homeLoading, setHomeLoading] = useState(false);

    /**
     * set current dashboard whether home dashboard
     */
    useEffect(() => {
        const newIsHome = Boolean(dashboardItem?.home);
        if (isHome === newIsHome) return;

        setIsHome(newIsHome);
    }, [dashboardItem, isHome]);

    const toggleHomeDashboard = useMemoizedFn(() => {
        /**
         * Request Data Functions
         */
        const onConfirm = async () => {
            try {
                setHomeLoading(true);

                if (!dashboardItem?.dashboard_id) return;

                const [error, resp] = await awaitWrap(
                    isHome
                        ? dashboardAPI.cancelAsHomeDashboard({
                              dashboardId: dashboardItem.dashboard_id,
                          })
                        : dashboardAPI.setAsHomeDashboard({
                              dashboardId: dashboardItem.dashboard_id,
                          }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                refreshDashboards?.();
                toast.success(getIntlText('common.message.operation_success'));
            } finally {
                setHomeLoading(false);
            }
        };

        /**
         * Only if home dashboard exists and you want to
         * set up a home dashboard, you need to double check the popup.
         */
        if (existedHomeDashboard && !isHome) {
            confirm({
                title: getIntlText('common.label.tip'),
                description: getIntlText('dashboard.set_as_home_dashboard_description'),
                icon: <ErrorIcon sx={{ color: 'var(--primary-color-base)' }} />,
                cancelButtonProps: {
                    disableRipple: true,
                },
                onConfirm,
            });

            return;
        }

        onConfirm?.();
    });

    const homeDashboardTip = useMemo(() => {
        return isHome
            ? getIntlText('dashboard.unset_as_home_dashboard_tip')
            : getIntlText('dashboard.set_as_home_dashboard_tip');
    }, [isHome, getIntlText]);

    const homeDashboardIcon = useMemo(() => {
        return isHome ? (
            <StarIcon sx={{ width: '16px', height: '16px' }} />
        ) : (
            <StarOutlinedIcon sx={{ width: '16px', height: '16px' }} />
        );
    }, [isHome]);

    const homeDashboardClassName = useMemo(() => {
        return classNames('dashboard-item__icon', {
            active: isHome,
        });
    }, [isHome]);

    return {
        isHome,
        toggleHomeDashboard,
        homeDashboardTip,
        homeDashboardIcon,
        homeDashboardClassName,
        homeLoading,
    };
}
