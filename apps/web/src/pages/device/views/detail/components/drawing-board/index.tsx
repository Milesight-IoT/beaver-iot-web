import React from 'react';
import { List } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingWrapper } from '@milesight/shared/src/components';

import { Empty } from '@/components';
import { type DeviceAPISchema, type DrawingBoardDetail } from '@/services/http';
import { DrawingBoard, DrawingBoardPropsType } from '@/components/drawing-board';

export interface DeviceDrawingBoardProps {
    isLoading?: boolean;
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;
    drawingBoardDetail?: DrawingBoardDetail;
    drawingBoardProps: DrawingBoardPropsType;
}

const DeviceDrawingBoard: React.FC<DeviceDrawingBoardProps> = props => {
    const { isLoading, deviceDetail, drawingBoardProps, drawingBoardDetail } = props;

    const { getIntlText } = useI18n();

    if (isLoading && deviceDetail) {
        return (
            <LoadingWrapper loading>
                <List sx={{ height: '300px' }} />
            </LoadingWrapper>
        );
    }

    if (!drawingBoardDetail) {
        return <Empty size="middle" text={getIntlText('common.label.empty')} />;
    }

    return (
        <DrawingBoard
            {...drawingBoardProps}
            drawingBoardDetail={drawingBoardDetail}
            deviceDetail={deviceDetail}
        />
    );
};

export default DeviceDrawingBoard;
