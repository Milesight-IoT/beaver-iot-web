import React from 'react';
import { IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { DashboardIcon } from '@milesight/shared/src/components';
import { useTheme, useMediaQuery } from '@milesight/shared/src/hooks';

import { SidebarController } from '@/components';
import DrawingBoardPath from '../drawing-board-path';

export interface ToolbarProps {
    drawingBoardOperation: () => JSX.Element;
}

/**
 * Dashboard detail toolbar
 */
const Toolbar: React.FC<ToolbarProps> = props => {
    const { drawingBoardOperation } = props;

    const navigate = useNavigate();
    const { breakpoints } = useTheme();
    const smallScreenSize = useMediaQuery(breakpoints.down('md'));

    return (
        <div className="dashboard-detail__toolbar">
            <div className="dashboard-detail__toolbar-left">
                <SidebarController />
                <IconButton className="md:d-none" onClick={() => navigate('/new-dashboard')}>
                    <DashboardIcon />
                </IconButton>
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
                <div className="dashboard-detail__toolbar-middle">Smart Agriculture</div>
            )}
            <div className="dashboard-detail__toolbar-right">
                {smallScreenSize && (
                    <IconButton onClick={() => navigate('/new-dashboard')}>
                        <DashboardIcon />
                    </IconButton>
                )}
                {drawingBoardOperation?.()}
            </div>
        </div>
    );
};

export default Toolbar;
