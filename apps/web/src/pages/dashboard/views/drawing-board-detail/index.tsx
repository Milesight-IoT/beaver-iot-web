import React from 'react';
import { List } from '@mui/material';
import { isNil } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingWrapper } from '@milesight/shared/src/components';

import { DrawingBoard, useDrawingBoard } from '@/components/drawing-board';
import { Toolbar } from './components';
import { useDashboardDetail } from './hooks';

import './style.less';

export interface DashboardDetailProps {
    id: ApiKey;
    deviceId?: ApiKey | null;
}

/**
 * DrawingBoard Detail component
 */
const DrawingBoardDetail: React.FC<DashboardDetailProps> = props => {
    const { id, deviceId } = props;

    const { getIntlText } = useI18n();
    const { dashboardDetail, loading, getDashboardDetail } = useDashboardDetail(id);
    const { drawingBoardProps, renderDrawingBoardOperation } = useDrawingBoard({
        disabled: !dashboardDetail,
        disabledEdit: !isNil(deviceId) || dashboardDetail?.attach_type === 'DEVICE',
        disabledEditTip: getIntlText('dashboard.tip.disabled_edit_device_drawing_board'),
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
                drawingBoardDetail={dashboardDetail}
                disabledEdit={!isNil(deviceId)}
            />
        );
    };

    return (
        <div className="ms-main">
            <Toolbar
                drawingBoardDetail={dashboardDetail}
                drawingBoardOperation={renderDrawingBoardOperation}
            />

            <div className="ms-view dashboard-detail">{renderDetail()}</div>
        </div>
    );
};

export default DrawingBoardDetail;
