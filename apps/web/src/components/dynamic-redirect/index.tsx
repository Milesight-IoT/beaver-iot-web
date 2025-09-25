import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useTheme } from '@milesight/shared/src/hooks';

import routes, { filterMobileRoutes } from '@/routes/routes';
import { useUserPermissions } from '@/hooks';

/**
 * the initial default redirect path
 */
const DynamicRedirect: React.FC = () => {
    const { matchTablet } = useTheme();
    const { hasPermission } = useUserPermissions();
    const finalRoutes = useMemo(() => {
        return matchTablet ? filterMobileRoutes(routes) : routes;
    }, [matchTablet]);

    /**
     * find the first route that has permission and returns
     */
    const navigatePath = useMemo(() => {
        const permissionRoute = finalRoutes?.find(
            r =>
                r.path &&
                r.handle?.layout !== 'blank' &&
                !r.handle?.hideInMenuBar &&
                hasPermission(r.handle?.permissions),
        );

        return permissionRoute?.path || '/403';
    }, [finalRoutes, hasPermission]);

    return <Navigate to={navigatePath} />;
};

export default DynamicRedirect;
