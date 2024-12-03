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

function BasicLayout() {
    const { lang } = useI18n();
    const menus = useMemo(() => {
        return routes
            .filter(route => route.path && route.handle?.layout !== 'blank')
            .map(route => ({
                name: route.handle?.title || '',
                path: route.path || '',
                icon: route.handle?.icon,
            }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    // ---------- 用户信息&鉴权&跳转相关处理逻辑 ----------
    const navigate = useNavigate();
    const [loading, setLoading] = useState<null | boolean>(null);
    const userInfo = useUserStore(state => state.userInfo);
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const token = iotLocalStorage.getItem(TOKEN_CACHE_KEY);

    useRequest(
        async () => {
            if (!token) {
                // 判断客户端是否已注册，若已注册则跳转登录页，否则跳转注册页
                const target = iotLocalStorage.getItem(REGISTERED_KEY)
                    ? '/auth/login'
                    : '/auth/register';

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

            if (error || !isRequestSuccess(resp)) return;
            setUserInfo(getResponseData(resp));
        },
        {
            refreshDeps: [userInfo],
            debounceWait: 300,
        },
    );

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
                    <main className="ms-layout-right">
                        <Outlet />
                    </main>
                </>
            )}
        </section>
    );
}

export default BasicLayout;
