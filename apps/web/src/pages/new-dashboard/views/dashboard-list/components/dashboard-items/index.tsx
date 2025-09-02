import React from 'react';

import { type DashboardDetail } from '@/services/http';
import DashboardItem from '../dashboard-item';

import './style.less';

export interface DashboardItemsProps {
    items?: DashboardDetail[];
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

/**
 * Dashboard items
 */
const DashboardItems: React.FC<DashboardItemsProps> = props => {
    const { items, existedHomeDashboard, selectedDashboard, handleSelectDashboard, getDashboards } =
        props;

    return (
        <div className="dashboard-items">
            {items?.map(item => (
                <DashboardItem
                    key={item.dashboard_id}
                    item={item}
                    existedHomeDashboard={existedHomeDashboard}
                    selectedDashboard={selectedDashboard}
                    handleSelectDashboard={handleSelectDashboard}
                    getDashboards={getDashboards}
                />
            ))}
        </div>
    );
};

export default DashboardItems;
