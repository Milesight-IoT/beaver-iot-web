import React from 'react';
import { IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { GridViewIcon } from '@milesight/shared/src/components';
import { useTheme, useMediaQuery, useI18n } from '@milesight/shared/src/hooks';

import { SidebarController, Tooltip } from '@/components';
import useDashboardStore from '@/pages/dashboard/store';
import DrawingBoardPath from '../drawing-board-path';

export interface ToolbarProps {
    drawingBoardOperation: () => JSX.Element;
}

/**
 * Dashboard detail toolbar
 */
const Toolbar: React.FC<ToolbarProps> = props => {
    const { drawingBoardOperation } = props;

    const { getIntlText } = useI18n();
    const navigate = useNavigate();
    const { breakpoints } = useTheme();
    const smallScreenSize = useMediaQuery(breakpoints.down('md'));
    const { paths } = useDashboardStore();

    return (
        <div className="dashboard-detail__toolbar">
            <div className="dashboard-detail__toolbar-left">
                <SidebarController />
                <Tooltip
                    className="md:d-none"
                    title={getIntlText('dashboard.tip.return_dashboard_list')}
                    enterDelay={1000}
                    enterNextDelay={1000}
                >
                    <IconButton onClick={() => navigate('/dashboard')}>
                        <GridViewIcon />
                    </IconButton>
                </Tooltip>
                <Divider
                    className="md:d-none"
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{
                        margin: '6px 12px',
                    }}
                />
                <DrawingBoardPath className="md:d-none" />
            </div>
            {smallScreenSize && (
                <div className="dashboard-detail__toolbar-middle">
                    <Tooltip
                        autoEllipsis
                        title={!!paths?.length && paths[paths.length - 1]?.name}
                    />
                </div>
            )}
            <div className="dashboard-detail__toolbar-right">
                {smallScreenSize && (
                    <IconButton onClick={() => navigate('/dashboard')}>
                        <GridViewIcon />
                    </IconButton>
                )}
                {drawingBoardOperation?.()}
            </div>
        </div>
    );
};

export default Toolbar;
