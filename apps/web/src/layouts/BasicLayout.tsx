import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { Stack, Skeleton } from '@mui/material';
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

function BasicLayout() {
    const { lang } = useI18n();

    // ---------- 用户信息&鉴权&跳转相关处理逻辑 ----------
    const navigate = useNavigate();
    const [loading, setLoading] = useState<null | boolean>(null);
    const userInfo = useUserStore(state => state.userInfo);
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const token = iotLocalStorage.getItem(TOKEN_CACHE_KEY);

    useRequest(
        async () => {
            // 判断客户端是否已注册，若已注册则跳转登录页，否则跳转注册页
            const target = iotLocalStorage.getItem(REGISTERED_KEY)
                ? '/auth/login'
                : '/auth/register';

            if (!token) {
                navigate(target, { replace: true });
                return;
            }
            // store 已有用户信息，则无需再次请求
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
                <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                    <Skeleton variant="rectangular" width={64} height="100%" />
                    <Stack spacing={1} sx={{ flex: 1 }}>
                        <Skeleton variant="rectangular" animation="wave" height={45} />
                        <Skeleton variant="rectangular" animation="wave" sx={{ flex: 1 }} />
                    </Stack>
                </Stack>
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
