import React, { useMemo } from 'react';
import { Checkbox } from '@mui/material';
import { isEmpty } from 'lodash-es';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';

import { LoadingWrapper, CheckBoxIcon } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type DashboardDetail } from '@/services/http';
import { useHomeDashboard, useDashboardDelete } from '../../hooks';
import MoreDropdown, { MORE_OPERATION } from '../more-dropdown';

import './style.less';

export interface DashboardItemsProps {
    item?: DashboardDetail;
    /**
     * Whether existed homeDashboard
     */
    existedHomeDashboard?: boolean;
    selectedDashboard: DashboardDetail[];
    /**
     * Handle select dashboard
     */
    handleSelectDashboard: (e: React.ChangeEvent<HTMLInputElement>, item?: DashboardDetail) => void;
    /** Refresh newest dashboards */
    getDashboards?: () => void;
}

const DashboardItem: React.FC<DashboardItemsProps> = props => {
    const { item, existedHomeDashboard, selectedDashboard, handleSelectDashboard, getDashboards } =
        props;

    const {
        toggleHomeDashboard,
        homeDashboardClassName,
        homeDashboardIcon,
        homeDashboardTip,
        homeLoading,
    } = useHomeDashboard({
        existedHomeDashboard,
        dashboardDetail: item,
        refreshDashboards: getDashboards,
    });
    const { handleDashboardDelete } = useDashboardDelete(getDashboards);

    const handleDashboardOperation = useMemoizedFn((type: MORE_OPERATION) => {
        switch (type) {
            case MORE_OPERATION.DELETE:
                item && handleDashboardDelete([item]);
                break;
            case MORE_OPERATION.EDIT:
                console.log('edit');
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
        <div
            className={cls('dashboard-item', {
                active: isCheckedDashboard,
            })}
        >
            <div className="dashboard-item__body">
                <img
                    className="dashboard-item__img"
                    alt="failed"
                    src="https://bing.ee123.net/img/cn/fhd/2025/08/11.jpg"
                />
            </div>
            <div className="dashboard-item__footer">
                <div className="dashboard-item__info">
                    <Tooltip
                        autoEllipsis
                        className="dashboard-item__info-name"
                        title={item?.name}
                    />
                    <Tooltip
                        autoEllipsis
                        className="dashboard-item__info-desc"
                        title={item?.created_at}
                    />
                </div>
                <MoreDropdown onOperation={handleDashboardOperation} />
            </div>
            <div className="dashboard-item__select">
                <Checkbox
                    icon={<div className="dashboard-item__select-icon" />}
                    checkedIcon={<CheckBoxIcon sx={{ width: '24px', height: '24px' }} />}
                    checked={isCheckedDashboard}
                    sx={{
                        padding: 0,
                        color: 'var(--text-color-tertiary)',
                    }}
                    onChange={e => handleSelectDashboard(e, item)}
                />
            </div>
            <div className="dashboard-item__home">
                <LoadingWrapper loading={homeLoading} size={24}>
                    <Tooltip title={homeDashboardTip}>
                        <div className={homeDashboardClassName} onClick={toggleHomeDashboard}>
                            {homeDashboardIcon}
                        </div>
                    </Tooltip>
                </LoadingWrapper>
            </div>
        </div>
    );
};

export default DashboardItem;
