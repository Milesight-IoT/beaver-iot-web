import React, { useMemo } from 'react';
import cls from 'classnames';
import { Tooltip } from '@/components';
import { LogStatusMap } from '@/pages/workflow/config';
import type { LogItemProps } from '../../types';
import './style.less';

export interface IProps {
    isActive?: boolean;
    data: LogItemProps;
    onClick?: (data: LogItemProps) => void;
}
export default React.memo(({ data, isActive, onClick }: IProps) => {
    const { status, title } = data || {};

    const { className: statusClassName, icon } = useMemo(() => LogStatusMap[status], [status]);
    return (
        <div
            className={cls('ms-log-item', {
                'ms-log-item--active': !!isActive,
            })}
            onClick={() => onClick?.(data)}
        >
            <div className={cls('ms-log-status', statusClassName)}>{icon}</div>
            <div className="ms-log-content">
                <p className="ms-log-title">
                    <Tooltip title={title} autoEllipsis />
                </p>
            </div>
        </div>
    );
});
