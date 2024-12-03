import { memo, useState, useEffect } from 'react';
import { useMatches, Link as RouterLink } from 'react-router-dom';
import { useI18n } from '@milesight/shared/src/hooks';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import './style.less';

export type NavsType = {
    path?: string;
    title: string;
    state?: any;
}[];

type Props = {
    /**
     * 自定义导航 title，kv 格式，key 为路由 pathname，value 为 title 值
     */
    // titles?: Record<string, string>;

    /**
     * 自定义导航 path & title，该属性有值时 `titles` 属性无效
     */
    navs?: NavsType;

    /**
     * 重写导航数据
     * @param navs 当前导航数据
     * @returns 返回最终导航数据
     */
    rewrite?: (navs: NavsType) => NavsType;

    /**
     * 自定义返回 Button 点击处理函数，默认回到第一个 nav 地址
     */
    // onBack?: () => void;
};

/**
 * 面包屑导航组件
 */
const MSBreadcrumbs: React.FC<Props> = memo(({ navs, rewrite }) => {
    const routes = useMatches();
    // const navigate = useNavigate();
    const { lang } = useI18n();
    const [innerNavs, setInnerNavs] = useState<NavsType>([]);

    // const handleBack = () => {
    //     if (onBack) {
    //         onBack();
    //         return;
    //     }

    //     const navLength = innerNavs.length;
    //     const targetNav = navLength < 2 ? innerNavs[0] : innerNavs[navLength - 2];

    //     navigate(targetNav.path, { replace: true, state: targetNav.state });
    // };

    useEffect(() => {
        let crumbs: NavsType = navs || [];

        if (!crumbs?.length) {
            crumbs = routes.slice(1).map(route => {
                const { title } = (route.handle || {}) as Record<string, any>;

                return {
                    title,
                    path: route.pathname,
                };
            });
        }

        crumbs = crumbs.filter(nav => nav.title);
        setInnerNavs(!rewrite ? crumbs : rewrite(crumbs));
    }, [routes, navs, lang, rewrite]);

    return (
        <div className="ms-breadcrumbs">
            <Breadcrumbs aria-label="breadcrumb" className="ms-breadcrumbs__inner">
                {innerNavs.map((nav, index) => {
                    const isLast = index === innerNavs.length - 1;

                    if (isLast || !nav.path) {
                        return (
                            <Typography
                                key={nav.path || `${index}-${nav.title}`}
                                sx={!isLast ? undefined : { color: 'text.primary' }}
                            >
                                {nav.title}
                            </Typography>
                        );
                    }

                    return (
                        <Link
                            key={nav.path}
                            underline="none"
                            color="inherit"
                            component={RouterLink}
                            to={nav.path}
                            state={nav.state}
                            sx={{ '&:hover': { color: 'primary.main' } }}
                        >
                            {nav.title}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </div>
    );
});

export default MSBreadcrumbs;
