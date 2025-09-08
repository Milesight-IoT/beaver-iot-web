import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DashboardList, DrawingBoardDetail } from './views';

const DashboardContainer: React.FC = () => {
    const [searchParams] = useSearchParams();

    const id = useMemo(() => {
        return searchParams?.get('id');
    }, [searchParams]);

    return id ? <DrawingBoardDetail id={id} /> : <DashboardList />;
};

export default DashboardContainer;
