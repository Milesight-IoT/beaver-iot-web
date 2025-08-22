import { type DashboardDetail, type WidgetDetail, type DeviceDetail } from '@/services/http';

export interface DrawingBoardExpose {
    /**
     * Exit dashboard editing status
     */
    handleCancel: () => void;
    /**
     * Save current newest drawing board data
     */
    handleSave: () => WidgetDetail[];
}

export interface DrawingBoardProps {
    drawingBoardDetail: DashboardDetail;
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
    /** Current device detail */
    deviceDetail?: DeviceDetail;
    updateOperatingPlugin: (plugin?: WidgetDetail) => void;
    /** Change drawing board edit mode */
    changeIsEdit: (isEditing: boolean) => void;
}
