import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    iotLocalStorage,
    TOKEN_CACHE_KEY,
    REGISTERED_KEY,
} from '@milesight/shared/src/utils/storage';
import routes from '@/routes/routes';
import { useUserStore } from '@/stores';
import { globalAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { Sidebar, RouteLoadingIndicator } from '@/components';
import { useUserPermissions } from '@/hooks';
import { useRoutePermission } from './hooks';
import { LayoutSkeleton } from './components';

function BasicLayout() {
    const { lang } = useI18n();

    // ---------- User information & Authentication & Jump related logic ----------
    const navigate = useNavigate();
    const [loading, setLoading] = useState<null | boolean>(null);
    const userInfo = useUserStore(state => state.userInfo);
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const token = iotLocalStorage.getItem(TOKEN_CACHE_KEY);

    useRequest(
        async () => {
            // Check whether the client is registered. If yes, go to the login page. If no, go to the registration page
            const target = iotLocalStorage.getItem(REGISTERED_KEY)
                ? '/auth/login'
                : '/auth/register';

            if (!token) {
                navigate(target, { replace: true });
                return;
            }
            // store already has user information, you do not need to request again
            if (userInfo) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const [error, resp] = await awaitWrap(globalAPI.getUserInfo());
            setLoading(false);

            if (error || !isRequestSuccess(resp)) {
                navigate(target, { replace: true });
                return;
            }

            setUserInfo(getResponseData(resp));
        },
        {
            refreshDeps: [userInfo],
            debounceWait: 300,
        },
    );

    /**
     * @description hooks
     * Determine whether the user has permission to access the current page.
     * No permission to jump directly to 403
     */
    const { hasPathPermission } = useRoutePermission(loading);

    /**
     * @description hooks
     * confirmation of permission
     */
    const { hasPermission } = useUserPermissions();

    /**
     * menus bar
     */
    const menus = useMemo(() => {
        return routes
            .filter(
                route =>
                    route.path &&
                    route.handle?.layout !== 'blank' &&
                    !route.handle?.hideInMenuBar &&
                    hasPermission(route.handle?.permissions),
            )
            .map(route => ({
                name: route.handle?.title || '',
                path: route.path || '',
                icon: route.handle?.icon,
            }));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang, hasPermission, loading]);

    return (
        <section className="ms-layout">
            <RouteLoadingIndicator />
            {loading !== false ? (
                // <CircularProgress sx={{ marginX: 'auto', alignSelf: 'center' }} />
                <LayoutSkeleton />
            ) : (
                <>
                    <Sidebar menus={menus} />
                    <main className="ms-layout-right">{hasPathPermission ? <Outlet /> : null}</main>
                </>
            )}
        </section>
    );
}

export default BasicLayout;
