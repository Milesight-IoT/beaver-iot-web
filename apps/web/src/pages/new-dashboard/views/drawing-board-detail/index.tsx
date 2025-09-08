import React from 'react';
import { List } from '@mui/material';
import { isNil } from 'lodash-es';

import { LoadingWrapper } from '@milesight/shared/src/components';

import { DrawingBoard, useDrawingBoard } from '@/components/drawing-board';
import { type DashboardDetail } from '@/services/http';
import { Toolbar } from './components';
import { useDashboardDetail } from './hooks';

import './style.less';

export interface DashboardDetailProps {
    id: ApiKey;
}

/**
 * DrawingBoard Detail component
 */
const DrawingBoardDetail: React.FC<DashboardDetailProps> = props => {
    const { id } = props;

    const { dashboardDetail, loading, getDashboardDetail } = useDashboardDetail(id);
    const { drawingBoardProps, renderDrawingBoardOperation } = useDrawingBoard({
        onSave: () => {
            getDashboardDetail?.();
        },
    });

    const renderDetail = () => {
        if (isNil(loading) || loading || !dashboardDetail) {
            return (
                <LoadingWrapper loading>
                    <List sx={{ height: '300px' }} />
                </LoadingWrapper>
            );
        }

        return (
            <DrawingBoard
                {...drawingBoardProps}
                drawingBoardDetail={dashboardDetail as DashboardDetail}
            />
        );
    };

    return (
        <div className="ms-main">
            <Toolbar drawingBoardOperation={renderDrawingBoardOperation} />

            <div className="ms-view dashboard-detail">{renderDetail()}</div>
        </div>
    );
};

export default DrawingBoardDetail;
