import { client, attachAPI, API_PREFIX } from './client';

/**
 * Device detail definition
 */
export interface DashboardDetail {
    dashboard_id: ApiKey;
    name: string;
    widgets: WidgetDetail[];
}

export interface WidgetDetail {
    widget_id?: ApiKey;
    tempId?: number; // Temporary id for front-end use
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
}

/**
 * Device-related API services
 */
export default attachAPI<DashboardAPISchema>(client, {
    apis: {
        getDashboards: `GET ${API_PREFIX}/dashboard/dashboards`,
        addDashboard: `POST ${API_PREFIX}/dashboard`,
        deleteDashboard: `DELETE ${API_PREFIX}/dashboard/:id`,
        updateDashboard: `PUT ${API_PREFIX}/dashboard/:dashboard_id`,
        addWidget: `POST ${API_PREFIX}/dashboard/:id/widget`,
        updateWidget: `PUT ${API_PREFIX}/dashboard/:id/widget/:widget_id`,
        deleteWidget: `DELETE ${API_PREFIX}/dashboard/:id/widget/:widget_id`,
    },
});
