import React from 'react';
import { Breadcrumbs } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import cls from 'classnames';

import { Tooltip } from '@/components';
import useDashboardStore from '@/pages/dashboard/store';

export interface DrawingBoardPathProps {
    className?: string;
    disabled?: boolean;
}

/**
 * Drawing board path
 */
const DrawingBoardPath: React.FC<DrawingBoardPathProps> = props => {
    const { className, disabled } = props;

    const { paths, setPath } = useDashboardStore();
    const navigate = useNavigate();

    return (
        <Breadcrumbs
            className={cls(className, {
                'adaptive-width': paths?.length === 1,
            })}
        >
            {paths.map((path, index) => {
                if (index === paths.length - 1) {
                    return (
                        <div
                            key={path.id}
                            className={cls('dashboard-detail__path-text', [
                                paths?.length === 1 ? 'adaptive-width' : 'limit-width',
                            ])}
                        >
                            <Tooltip title={path.name} autoEllipsis />
                        </div>
                    );
                }

                return (
                    <div
                        key={path.id}
                        className={cls('dashboard-detail__path', { disabled })}
                        onClick={() => {
                            if (disabled) {
                                return;
                            }

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
