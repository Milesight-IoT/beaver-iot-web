import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { List } from '@mui/material';

import { LoadingWrapper } from '@milesight/shared/src/components';

import { DashboardList, DrawingBoardDetail } from './views';
import useDashboardStore from './store';
import { useMainCanvas } from './hooks';

const DashboardContainer: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { clearPaths } = useDashboardStore();
    const { loading, defaultId, setDefaultId } = useMainCanvas();

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

    /**
     * Jump to default main drawing board
     */
    useEffect(() => {
        if (defaultId) {
            setSearchParams(`?id=${defaultId}`);
            setDefaultId(undefined);
        }
    }, [defaultId, setDefaultId, setSearchParams]);

    const renderDashboard = () => {
        if (loading) {
            return (
                <LoadingWrapper loading>
                    <List sx={{ height: '300px' }} />
                </LoadingWrapper>
            );
        }

        return id ? <DrawingBoardDetail id={id} deviceId={deviceId} /> : <DashboardList />;
    };

    return renderDashboard();
};

export default DashboardContainer;
