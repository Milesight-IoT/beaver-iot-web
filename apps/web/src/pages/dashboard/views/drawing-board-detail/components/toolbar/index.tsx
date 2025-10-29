import React, { useMemo } from 'react';
import { IconButton, Divider, type SxProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isNil } from 'lodash-es';
import cls from 'classnames';

import { GridViewIcon, ArrowBackIcon } from '@milesight/shared/src/components';
import { useTheme, useI18n } from '@milesight/shared/src/hooks';

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
    const { matchTablet } = useTheme();
    const { paths } = useDashboardStore();

    const renderSidebar = () => {
        const pathIndex = paths?.findIndex(p => p.id === drawingBoardDetail?.id);
        if (!matchTablet || isNil(pathIndex) || pathIndex < 1) {
            return <SidebarController />;
        }

        return (
            <IconButton onClick={() => window.history.back()}>
                <ArrowBackIcon />
            </IconButton>
        );
    };

    const gridViewIconSx: SxProps = useMemo(() => {
        const baseSx: SxProps = {
            color: 'text.secondary',
        };

        if (matchTablet) {
            return {
                ...baseSx,
                '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                    color: 'text.secondary',
                },
            };
        }

        return baseSx;
    }, [matchTablet]);

    const GridViewIconJSX = (
        <IconButton sx={gridViewIconSx} onClick={() => navigate('/dashboard')}>
            <GridViewIcon />
        </IconButton>
    );

    return (
        <div className="dashboard-detail__toolbar">
            <div className="dashboard-detail__toolbar-left">
                {renderSidebar()}
                <Tooltip
                    className={cls({
                        'd-none': matchTablet,
                    })}
                    title={getIntlText('dashboard.tip.return_dashboard_list')}
                >
                    {GridViewIconJSX}
                </Tooltip>
                <Divider
                    className={cls({
                        'd-none': matchTablet,
                    })}
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{
                        margin: '6px 12px',
                    }}
                />
                <DrawingBoardPath
                    className={cls({
                        'd-none': matchTablet,
                    })}
                />
            </div>
            {matchTablet && (
                <div className="dashboard-detail__toolbar-middle">
                    <Tooltip
                        autoEllipsis
                        title={!!paths?.length && paths[paths.length - 1]?.name}
                    />
                </div>
            )}
            <div className="dashboard-detail__toolbar-right">
                {matchTablet && GridViewIconJSX}
                {drawingBoardOperation?.()}
            </div>
        </div>
    );
};

export default Toolbar;
