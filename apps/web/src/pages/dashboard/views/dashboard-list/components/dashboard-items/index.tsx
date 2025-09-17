import React from 'react';

import { type DashboardListProps } from '@/services/http';
import DashboardItem from '../dashboard-item';

import './style.less';

export interface DashboardItemsProps {
    items?: DashboardListProps[];
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

/**
 * Dashboard items
 */
const DashboardItems: React.FC<DashboardItemsProps> = props => {
    const {
        items,
        existedHomeDashboard,
        selectedDashboard,
        handleSelectDashboard,
        getDashboards,
        openEditDashboard,
    } = props;

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
                    openEditDashboard={openEditDashboard}
                />
            ))}
        </div>
    );
};

export default DashboardItems;
