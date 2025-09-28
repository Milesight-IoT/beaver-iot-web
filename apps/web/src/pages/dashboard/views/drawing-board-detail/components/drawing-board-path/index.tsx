import React from 'react';
import { Breadcrumbs } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { Tooltip } from '@/components';
import useDashboardStore from '@/pages/dashboard/store';

export interface DrawingBoardPathProps {
    className?: string;
}

/**
 * Drawing board path
 */
const DrawingBoardPath: React.FC<DrawingBoardPathProps> = props => {
    const { className } = props;

    const { paths, setPath } = useDashboardStore();
    const navigate = useNavigate();

    return (
        <Breadcrumbs className={className}>
            {paths.map((path, index) => {
                if (index === paths.length - 1) {
                    return (
                        <div key={path.id} className="dashboard-detail__path-text">
                            <Tooltip title={path.name} autoEllipsis />
                        </div>
                    );
                }

                return (
                    <div
                        key={path.id}
                        className="dashboard-detail__path"
                        onClick={() => {
                            setPath(path);
                            navigate(`/dashboard?id=${path.id}`);
                        }}
                    >
                        <Tooltip title={path.name} autoEllipsis />
                    </div>
                );
            })}
        </Breadcrumbs>
    );
};

export default DrawingBoardPath;
