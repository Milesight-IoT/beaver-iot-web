import { client, attachAPI, API_PREFIX } from './client';

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

/** Dashboard list props */
export interface DashboardListProps {
    dashboard_id: ApiKey;
    name: string;
    /** is home dashboard */
    home: boolean;
    created_at: string;
    user_id: ApiKey;
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
        request: void;
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
        };
        response: unknown;
    };

    /** Delete dashboard */
    deleteDashboard: {
        request: {
            id: ApiKey;
        };
        response: unknown;
    };

    /** Update dashboard */
    updateDashboard: {
        request: {
            dashboard_id: ApiKey;
            /** name */
            name?: string;
            widgets?: WidgetDetail[];
            /** The entities ids that is used in dashboard */
            entity_ids?: ApiKey[];
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
}

/**
 * Device-related API services
 */
export default attachAPI<DashboardAPISchema>(client, {
    apis: {
        getDashboards: `GET ${API_PREFIX}/dashboard/dashboards`,
        getDashboardDetail: `GET ${API_PREFIX}/dashboard/:id`,
        addDashboard: `POST ${API_PREFIX}/dashboard`,
        deleteDashboard: `DELETE ${API_PREFIX}/dashboard/:id`,
        updateDashboard: `PUT ${API_PREFIX}/dashboard/:dashboard_id`,
        addWidget: `POST ${API_PREFIX}/dashboard/:id/widget`,
        updateWidget: `PUT ${API_PREFIX}/dashboard/:id/widget/:widget_id`,
        deleteWidget: `DELETE ${API_PREFIX}/dashboard/:id/widget/:widget_id`,
        setAsHomeDashboard: `POST ${API_PREFIX}/dashboard/:dashboardId/home`,
        cancelAsHomeDashboard: `POST ${API_PREFIX}/dashboard/:dashboardId/cancel-home`,
    },
});
