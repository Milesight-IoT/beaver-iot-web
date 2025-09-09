import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DashboardList, DrawingBoardDetail } from './views';
import useDashboardStore from './store';

const DashboardContainer: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { clearPaths } = useDashboardStore();

    const id = useMemo(() => {
        return searchParams?.get('id');
    }, [searchParams]);

    const deviceId = useMemo(() => {
        return searchParams?.get('deviceId');
    }, [searchParams]);

    /**
     * Returning to the dashboard list will
     * clear the history path data
     */
    useEffect(() => {
        if (!id) {
            clearPaths?.();
        }
    }, [id, clearPaths]);

    return id ? <DrawingBoardDetail id={id} deviceId={deviceId} /> : <DashboardList />;
};

export default DashboardContainer;
