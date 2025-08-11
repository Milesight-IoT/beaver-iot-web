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

    /** Get detail */
    getDashboardDetail: {
        request: {
            id: ApiKey;
        };
        response: DashboardDetail & {
            entities: {
                entity_id: string;
                entity_key: string;
                entity_name: string;
                entity_parent_name?: string;
                entity_description?: string;
                entity_type: EntityType;
                entity_is_customized: boolean;
                entity_access_mod: EntityAccessMode;
                entity_value_type: string;
                entity_value_attribute?: Partial<EntityValueAttributeType>;
                entity_created_at: number;
                entity_updated_at: number;
                integration_name?: string;
                device_name?: string;
            }[];
        };
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
