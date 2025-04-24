import intl from 'react-intl-universal';
import { Outlet, RouteObject } from 'react-router-dom';
import {
    DashboardCustomizeIcon,
    DevicesFilledIcon,
    IntegrationInstructionsIcon,
    Person4Icon,
    EntityFilledIcon,
    WorkflowIcon,
    SettingsIcon,
} from '@milesight/shared/src/components';
import { PERMISSIONS } from '@/constants';
import ErrorBoundaryComponent from './error-boundary';

type RouteObjectType = RouteObject & {
    /** Custom routing metadata */
    handle?: {
        title?: string;

        /** Menu icon */
        icon?: React.ReactNode;

        /**
         * Layout type, default is' basic '
         *
         * Note: The type here should be LayoutType, but inference errors can occur, so it is temporarily defined as string
         */
        layout?: string;

        /** Whether to access without login, default 'false' (login required) */
        authFree?: boolean;

        /**
         * The page should be accessible based on satisfying one of the functions of the current route
         * Then satisfying one of the permissions in the array enables the current routing access
         */
        permissions?: PERMISSIONS | PERMISSIONS[];

        /**
         * Whether to hide in the menu bar
         */
        hideInMenuBar?: boolean;

        /** Hide the sidebar */
        hideSidebar?: boolean;
    };

    /** subroute */
    children?: RouteObjectType[];
};

const ErrorBoundary = () => <ErrorBoundaryComponent inline />;

const routes: RouteObjectType[] = [
    {
        path: '/dashboard',
        handle: {
            get title() {
                return intl.get('common.label.dashboard');
            },
            icon: <DashboardCustomizeIcon fontSize="small" />,
            permissions: PERMISSIONS.DASHBOARD_MODULE,
        },
        async lazy() {
            const { default: Component } = await import('@/pages/dashboard');
            return { Component };
        },
        ErrorBoundary,
    },
    {
        path: '/device',
        element: <Outlet />,
        ErrorBoundary,
        handle: {
            get title() {
                return intl.get('common.label.device');
            },
            icon: <DevicesFilledIcon fontSize="small" />,
            permissions: PERMISSIONS.DEVICE_MODULE,
        },
        children: [
            {
                index: true,
                async lazy() {
                    const { default: Component } = await import('@/pages/device');
                    return { Component };
                },
                ErrorBoundary,
            },
            {
                index: true,
                path: 'detail/:deviceId',
                handle: {
                    get title() {
                        return intl.get('common.label.detail');
                    },
                },
                async lazy() {
                    const { default: Component } = await import('@/pages/device/views/detail');
                    return { Component };
                },
                ErrorBoundary,
            },
        ],
    },
    {
        path: '/integration',
        element: <Outlet />,
        ErrorBoundary,
        handle: {
            get title() {
                return intl.get('common.label.integration');
            },
            icon: <IntegrationInstructionsIcon fontSize="small" />,
            permissions: PERMISSIONS.INTEGRATION_MODULE,
        },
        children: [
            {
                index: true,
                async lazy() {
                    const { default: Component } = await import('@/pages/integration');
                    return { Component };
                },
                ErrorBoundary,
            },
            {
                path: 'detail/:integrationId',
                handle: {
                    get title() {
                        return intl.get('common.label.integration');
                    },
                },
                async lazy() {
                    const { default: Component } = await import(
                        '@/pages/integration/views/integration-detail'
                    );
                    return { Component };
                },
                ErrorBoundary,
            },
        ],
    },
    {
        path: '/entity',
        element: <Outlet />,
        ErrorBoundary,
        handle: {
            get title() {
                return intl.get('common.label.entity');
            },
            icon: <EntityFilledIcon fontSize="small" />,
            permissions: PERMISSIONS.ENTITY_MODULE,
        },
        children: [
            {
                index: true,
                async lazy() {
                    const { default: Component } = await import('@/pages/entity');
                    return { Component };
                },
                ErrorBoundary,
            },
        ],
    },
    {
        path: '/workflow',
        element: <Outlet />,
        ErrorBoundary,
        handle: {
            get title() {
                return intl.get('common.label.workflow');
            },
            icon: <WorkflowIcon fontSize="small" />,
            permissions: PERMISSIONS.WORKFLOW_MODULE,
        },
        children: [
            {
                index: true,
                async lazy() {
                    const { default: Component } = await import('@/pages/workflow');
                    return { Component };
                },
                ErrorBoundary,
            },
            {
                path: 'editor',
                handle: {
                    get title() {
                        return intl.get('common.label.editor');
                    },
                    hideSidebar: true,
                },
                async lazy() {
                    const { default: Component } = await import('@/pages/workflow/views/editor');
                    return { Component };
                },
                ErrorBoundary,
            },
        ],
    },
    {
        path: '/user-role',
        handle: {
            get title() {
                return intl.get('user.label.user_role');
            },
            icon: <Person4Icon fontSize="small" />,
            permissions: PERMISSIONS.USER_ROLE_MODULE,
        },
        async lazy() {
            const { default: Component } = await import('@/pages/user-role');
            return { Component };
        },
        ErrorBoundary,
    },
    {
        path: '/credentials',
        handle: {
            get title() {
                return intl.get('common.label.setting');
            },
            icon: <SettingsIcon fontSize="small" />,
            permissions: PERMISSIONS.CREDENTIAL_MODULE,
        },
        async lazy() {
            const { default: Component } = await import('@/pages/credentials');
            return { Component };
        },
        ErrorBoundary,
    },
    {
        path: '/403',
        handle: {
            title: '403',
            hideInMenuBar: true,
        },
        async lazy() {
            const { default: Component } = await import('@/pages/403');
            return { Component };
        },
        ErrorBoundary,
    },
    {
        path: '/auth',
        handle: {
            layout: 'blank',
        },
        // element: <Outlet />,
        async lazy() {
            const { default: Component } = await import('@/pages/auth');
            return { Component };
        },
        ErrorBoundary,
        children: [
            {
                index: true,
                path: 'login',
                handle: {
                    get title() {
                        return intl.get('common.label.login');
                    },
                    layout: 'blank',
                },
                async lazy() {
                    const { default: Component } = await import('@/pages/auth/views/login');
                    return { Component };
                },
                ErrorBoundary,
            },
            {
                path: 'register',
                handle: {
                    get title() {
                        return intl.get('common.label.register');
                    },
                    layout: 'blank',
                },
                async lazy() {
                    const { default: Component } = await import('@/pages/auth/views/register');
                    return { Component };
                },
                ErrorBoundary,
            },
        ],
    },
    {
        path: '*',
        handle: {
            title: '404',
            layout: 'blank',
            authFree: true,
        },
        async lazy() {
            const { default: Component } = await import('@/pages/404');
            return { Component };
        },
        ErrorBoundary,
    },
];

export default routes;
