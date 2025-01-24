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
     * The value is in the kv format. The key is the route pathname and the value is the title value
     */
    // titles?: Record<string, string>;

    /**
     * Custom navigation path & title, the titles property is invalid when this property has a value
     */
    navs?: NavsType;

    /**
     * Overwrite navigation data
     * @param navs Current navigation data
     * @returns Returns the final navigation data
     */
    rewrite?: (navs: NavsType) => NavsType;

    /**
     * Custom return Button click handler, default goes back to the first nav address
     */
    // onBack?: () => void;
};

/**
 * Breadcrumb navigation component
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
