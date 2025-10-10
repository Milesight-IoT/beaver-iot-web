import { type DrawingBoardDetail, type WidgetDetail, type DeviceAPISchema } from '@/services/http';

export interface DrawingBoardExpose {
    /**
     * Exit dashboard editing status
     */
    handleCancel: () => void;
    /**
     * Save current newest drawing board data
     */
    handleSave: () => DrawingBoardDetail;
}

export interface DrawingBoardProps {
    /** Current device detail */
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;
    drawingBoardDetail: DrawingBoardDetail;
    isEdit: boolean;
    /**
     * Does the home dashboard exist in all dashboards ?
     */
    existedHomeDashboard?: boolean;
    /** The widget plugin currently being added or edited */
    operatingPlugin?: WidgetDetail;
    isFullscreen: boolean;
    /** Drawing board html div node */
    drawingBoardRef: React.RefObject<HTMLDivElement>;
    disabledEdit?: boolean;
    updateOperatingPlugin: (plugin?: WidgetDetail) => void;
    /** Change drawing board edit mode */
    changeIsEdit: (isEditing: boolean) => void;
    /** Exit body fullscreen */
    exitFullscreen: () => void;
}
