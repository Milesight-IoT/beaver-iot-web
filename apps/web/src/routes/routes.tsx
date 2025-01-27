import intl from 'react-intl-universal';
import { Outlet, RouteObject } from 'react-router-dom';
import {
    DashboardCustomizeIcon,
    DevicesFilledIcon,
    IntegrationInstructionsIcon,
    Person4Icon,
    EntityIcon,
    WorkflowIcon,
} from '@milesight/shared/src/components';
import { PERMISSIONS } from '@/constants';
import ErrorBoundaryComponent from './error-boundary';

type RouteObjectType = RouteObject & {
    /** 自定义路由元数据 */
    handle?: {
        title?: string;

        /** 菜单图标 */
        icon?: React.ReactNode;

        /**
         * 布局类型，默认为 `basic`
         *
         * 注意：此处类型应为 LayoutType，但会出现推断错误，故暂定义为 string
         */
        layout?: string;

        /** 是否无需登录便可访问，默认 `false` (需要登录) */
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

        /** 隐藏侧边栏 */
        hideSidebar?: boolean;
    };

    /** 子路由 */
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
            icon: <EntityIcon fontSize="small" />,
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
        element: <Outlet />,
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
