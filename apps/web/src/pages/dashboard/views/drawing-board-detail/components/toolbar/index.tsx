import React from 'react';
import { IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isNil } from 'lodash-es';

import { GridViewIcon, ArrowBackIcon } from '@milesight/shared/src/components';
import { useTheme, useMediaQuery, useI18n } from '@milesight/shared/src/hooks';

import { SidebarController, Tooltip } from '@/components';
import useDashboardStore from '@/pages/dashboard/store';
import { type DrawingBoardDetail } from '@/services/http';
import DrawingBoardPath from '../drawing-board-path';

export interface ToolbarProps {
    drawingBoardDetail?: DrawingBoardDetail;
    drawingBoardOperation: () => JSX.Element;
}

/**
 * Dashboard detail toolbar
 */
const Toolbar: React.FC<ToolbarProps> = props => {
    const { drawingBoardDetail, drawingBoardOperation } = props;

    const { getIntlText } = useI18n();
    const navigate = useNavigate();
    const { breakpoints } = useTheme();
    const smallScreenSize = useMediaQuery(breakpoints.down('md'));
    const { paths } = useDashboardStore();

    const renderSidebar = () => {
        const pathIndex = paths?.findIndex(p => p.id === drawingBoardDetail?.id);
        if (!smallScreenSize || isNil(pathIndex) || pathIndex < 1) {
            return <SidebarController />;
        }

        return (
            <IconButton onClick={() => window.history.back()}>
                <ArrowBackIcon />
            </IconButton>
        );
    };

    return (
        <div className="dashboard-detail__toolbar">
            <div className="dashboard-detail__toolbar-left">
                {renderSidebar()}
                <Tooltip
                    className="md:d-none"
                    title={getIntlText('dashboard.tip.return_dashboard_list')}
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
