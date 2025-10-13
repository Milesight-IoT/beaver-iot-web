import { client, attachAPI, API_PREFIX } from './client';

/**
 * Dashboard cover type
 */
export type DashboardCoverType = 'DEFAULT_IMAGE' | 'COLOR' | 'RESOURCE';

export type AttachType = 'DASHBOARD' | 'DEVICE';

/**
 * Device detail definition
 */
export interface DashboardDetail {
    dashboard_id: ApiKey;
    name: string;
    widgets: WidgetDetail[];
    /** is home dashboard */
    home: boolean;
    created_at: string;
    entities?: EntityData[];
    entity_ids?: ApiKey[];
    user_id: ApiKey;
}

/**
 * Drawing board detail
 */
export interface DrawingBoardDetail {
    id: ApiKey;
    name: string;
    attach_type: AttachType;
    attach_id: ApiKey;
    widgets: WidgetDetail[];
    entity_ids?: ApiKey[];
    entities?: EntityData[];
}

/** Dashboard list props */
export interface DashboardListProps {
    dashboard_id: ApiKey;
    user_id: ApiKey;
    name: string;
    /** is home dashboard */
    home: boolean;
    main_canvas_id: ApiKey;
    created_at: string;
    description?: string;
    cover_type?: DashboardCoverType;
    cover_data?: string;
}

export interface WidgetDetail {
    widget_id?: ApiKey;
    tempId?: ApiKey; // Temporary id for front-end use
    data: Record<string, any>;
}

/**
 * Device related interface definition
 */
export interface DashboardAPISchema extends APISchema {
    /** Get list */
    getDashboards: {
        request: {
            name: string;
        };
        response: DashboardDetail[];
    };

    /** Get detail */
    getDashboardDetail: {
        request: {
            id: ApiKey;
        };
        response: DashboardDetail;
    };

    /** Add dashboard */
    addDashboard: {
        request: {
            /** name */
            name: string;
            description?: string;
            cover_type?: DashboardCoverType;
            cover_data?: string;
        };
        response: {
            dashboard_id: ApiKey;
            main_canvas_id: ApiKey;
        };
    };

    /** Delete dashboard */
    deleteDashboard: {
        request: {
            dashboard_ids: ApiKey[];
        };
        response: unknown;
    };

    /** Update dashboard */
    updateDashboard: {
        request: {
            dashboard_id: ApiKey;
            /** name */
            name?: string;
            description?: string;
            cover_type?: string;
            cover_data?: string;
        };
        response: unknown;
    };

    /** Add component */
    addWidget: {
        request: Record<string, any>;
        response: unknown;
    };

    /** Remove component */
    deleteWidget: {
        request: {
            dashboard_id: ApiKey;
            widget_id: ApiKey;
        };
        response: unknown;
    };

    /** Update component */
    updateWidget: {
        request: Record<string, any>;
        response: unknown;
    };

    /** set as home dashboard */
    setAsHomeDashboard: {
        request: {
            dashboardId: ApiKey;
        };
        response: void;
    };
    /** cancel as home dashboard */
    cancelAsHomeDashboard: {
        request: {
            dashboardId: ApiKey;
        };
        response: void;
    };
    /** Update drawing board */
    updateDrawingBoard: {
        request: {
            canvas_id: ApiKey;
            /** name */
            name?: string;
            widgets?: WidgetDetail[];
            /** The entities ids that is used in dashboard */
            entity_ids?: ApiKey[];
            /** The device ids that is used in dashboard */
            device_ids?: ApiKey[];
        };
        response: unknown;
    };
    /** Get dashboard preset-covers */
    getDashboardPresetCovers: {
        request: void;
        response: {
            name: string;
            type: DashboardCoverType;
            data: string;
        }[];
    };
    /**
     * Get drawing board detail info
     */
    getDrawingBoardDetail: {
        request: {
            canvas_id: ApiKey;
        };
        response: DrawingBoardDetail;
    };
    /**
     * Add dashboard drawing board
     */
    addDrawingBoard: {
        request: {
            dashboard_id: ApiKey;
            name: string;
        };
        response: {
            canvas_id: string;
        };
    };
    /**
     * Delete dashboard drawing board
     */
    deleteDrawingBoard: {
        request: {
            dashboard_id: ApiKey;
            canvas_ids: string[];
        };
        response: void;
    };
    /**
     * Get drawing board list
     */
    getDrawingBoardList: {
        request: {
            dashboard_id: ApiKey;
        };
        response: {
            canvas_id: string;
            name: string;
            attach_type: AttachType;
            attach_id: string;
        };
    };
    /**
     * Get device dashboard drawing board
     */
    getDeviceDrawingBoard: {
        request: {
            device_id: ApiKey;
        };
        response: {
            canvas_id: string;
        };
    };
    /**
     * Get Default dashboard main drawing board
     */
    getDefaultMainDrawingBoard: {
        request: void;
        response: {
            dashboard_id: ApiKey;
            main_canvas_id: string;
        };
    };
}

/**
 * Device-related API services
 */
export default attachAPI<DashboardAPISchema>(client, {
    apis: {
        getDashboards: `POST ${API_PREFIX}/dashboard/search`,
        getDashboardDetail: `GET ${API_PREFIX}/dashboard/:id`,
        addDashboard: `POST ${API_PREFIX}/dashboard`,
        deleteDashboard: `POST ${API_PREFIX}/dashboard/batch-delete`,
        updateDashboard: `PUT ${API_PREFIX}/dashboard/:dashboard_id`,
        addWidget: `POST ${API_PREFIX}/dashboard/:id/widget`,
        updateWidget: `PUT ${API_PREFIX}/dashboard/:id/widget/:widget_id`,
        deleteWidget: `DELETE ${API_PREFIX}/dashboard/:id/widget/:widget_id`,
        setAsHomeDashboard: `POST ${API_PREFIX}/dashboard/:dashboardId/home`,
        cancelAsHomeDashboard: `POST ${API_PREFIX}/dashboard/:dashboardId/cancel-home`,
        updateDrawingBoard: `PUT ${API_PREFIX}/canvas/:canvas_id`,
        getDashboardPresetCovers: `GET ${API_PREFIX}/dashboard/covers`,
        getDrawingBoardDetail: `GET ${API_PREFIX}/canvas/:canvas_id`,
        addDrawingBoard: `POST ${API_PREFIX}/dashboard/:dashboard_id/canvas`,
        deleteDrawingBoard: `DELETE ${API_PREFIX}/dashboard/:dashboard_id/canvas/batch-delete`,
        getDrawingBoardList: `GET ${API_PREFIX}/dashboard/:dashboard_id/canvas`,
        getDeviceDrawingBoard: `GET ${API_PREFIX}/device/:device_id/canvas`,
        getDefaultMainDrawingBoard: `GET ${API_PREFIX}/dashboard/main-canvas`,
    },
});
