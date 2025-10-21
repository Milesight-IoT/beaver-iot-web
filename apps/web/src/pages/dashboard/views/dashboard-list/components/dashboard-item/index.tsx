import React, { useMemo } from 'react';
import { Checkbox } from '@mui/material';
import { isEmpty } from 'lodash-es';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';

import {
    LoadingWrapper,
    UncheckedCheckboxIcon,
    CheckedCheckboxIcon,
} from '@milesight/shared/src/components';
import { useTheme } from '@milesight/shared/src/hooks';

import { Tooltip } from '@/components';
import { type DashboardListProps } from '@/services/http';
import { genImageUrl } from '@/utils';
import { useHomeDashboard, useDashboardDelete } from '../../hooks';
import MoreDropdown, { MORE_OPERATION } from '../more-dropdown';
import useDashboardListStore from '../../store';
import { getDefaultImg } from '../../utils';
import { useJumpToDetail } from './useJumpToDetail';

import './style.less';

export interface DashboardItemProps {
    item?: DashboardListProps;
    /**
     * Whether existed homeDashboard
     */
    existedHomeDashboard?: boolean;
    selectedDashboard: DashboardListProps[];
    /**
     * Handle select dashboard
     */
    handleSelectDashboard: (
        e: React.ChangeEvent<HTMLInputElement>,
        item?: DashboardListProps,
    ) => void;
    /** Refresh newest dashboards */
    getDashboards?: () => void;
    /** Open the modal of edit dashboard */
    openEditDashboard?: (item: DashboardListProps) => void;
}

const DashboardItem: React.FC<DashboardItemProps> = props => {
    const {
        item,
        existedHomeDashboard,
        selectedDashboard,
        handleSelectDashboard,
        getDashboards,
        openEditDashboard,
    } = props;

    const { matchMobile, matchTablet } = useTheme();
    const {
        toggleHomeDashboard,
        isHome,
        homeDashboardClassName,
        homeDashboardIcon,
        homeDashboardTip,
        homeLoading,
    } = useHomeDashboard({
        existedHomeDashboard,
        dashboardItem: item,
        refreshDashboards: getDashboards,
    });
    const { handleDashboardDelete } = useDashboardDelete(getDashboards);
    const { coverImages } = useDashboardListStore();
    const { resourceCheckLoading, handleJumpToDetail } = useJumpToDetail();

    const handleItemClick = useMemoizedFn(() => {
        handleJumpToDetail(item);
    });

    const handleDashboardOperation = useMemoizedFn((type: MORE_OPERATION) => {
        switch (type) {
            case MORE_OPERATION.DELETE:
                item && handleDashboardDelete([item]);
                break;
            case MORE_OPERATION.EDIT:
                item && openEditDashboard?.(item);
                break;
            default:
                break;
        }
    });

    const isCheckedDashboard = useMemo(() => {
        if (!item || !Array.isArray(selectedDashboard) || isEmpty(selectedDashboard)) {
            return false;
        }

        return selectedDashboard.some(d => d.dashboard_id === item.dashboard_id);
    }, [item, selectedDashboard]);

    return (
        <Tooltip title={matchMobile ? undefined : item?.description}>
            <div
                className={cls('dashboard-item', {
                    active: isCheckedDashboard,
                    'hidden-border-color': matchTablet,
                })}
                onClick={handleItemClick}
            >
                <LoadingWrapper loading={resourceCheckLoading}>
                    <div className="dashboard-item__body">
                        <img
                            className="dashboard-item__img"
                            alt="failed"
                            src={genImageUrl(
                                item?.cover_data ||
                                    getDefaultImg(coverImages) ||
                                    'https://bing.ee123.net/img/cn/fhd/2025/08/11.jpg',
                            )}
                        />
                    </div>
                </LoadingWrapper>
                <div className="dashboard-item__footer">
                    <div className="dashboard-item__info">
                        <Tooltip
                            autoEllipsis
                            className="dashboard-item__info-name"
                            title={item?.name}
                        />
                        {matchMobile && (
                            <Tooltip
                                autoEllipsis
                                className="dashboard-item__info-desc"
                                title={item?.description}
                            />
                        )}
                    </div>
                    <MoreDropdown onOperation={handleDashboardOperation} />
                </div>
                <div
                    className={cls('dashboard-item__select', {
                        'd-none': matchTablet,
                    })}
                    onClick={e => e?.stopPropagation()}
                >
                    <Checkbox
                        icon={<UncheckedCheckboxIcon sx={{ width: '24px', height: '24px' }} />}
                        checkedIcon={<CheckedCheckboxIcon sx={{ width: '24px', height: '24px' }} />}
                        checked={isCheckedDashboard}
                        sx={{
                            padding: 0,
                            color: 'var(--text-color-tertiary)',
                        }}
                        onChange={e => handleSelectDashboard(e, item)}
                    />
                </div>
                <div
                    className={cls('dashboard-item__home', {
                        'is-home': isHome,
                        'd-none': matchTablet,
                    })}
                    onClick={e => e?.stopPropagation()}
                >
                    <LoadingWrapper loading={homeLoading} size={24}>
                        <Tooltip title={homeDashboardTip}>
                            <div className={homeDashboardClassName} onClick={toggleHomeDashboard}>
                                {homeDashboardIcon}
                            </div>
                        </Tooltip>
                    </LoadingWrapper>
                </div>
            </div>
        </Tooltip>
    );
};

export default DashboardItem;
