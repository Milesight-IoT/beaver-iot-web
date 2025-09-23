import React from 'react';
import cls from 'classnames';
import { SpaceDashboardIcon } from '@milesight/shared/src/components/icons';
import Tooltip from '../tooltip';
import './style.less';

interface Props {
    /** Title */
    title: React.ReactNode;

    /** Icon tooltip */
    tooltip?: React.ReactNode;

    /** Icon */
    icon?: React.ReactElement | null;
}

/**
 * Title icon component
 *
 * @param {React.ReactNode} title - Title
 * @param {React.ReactNode} tooltip - Icon tooltip
 * @param {React.ReactElement} icon - Icon
 * @description Mainly used for titles with blueprint icons in tables
 */
const TitleIcon: React.FC<Props> = ({ title, tooltip, icon = <SpaceDashboardIcon /> }: Props) => {
    return (
        <div className={cls('ms-title-icon', { 'no-icon': !icon || !tooltip })}>
            <Tooltip autoEllipsis className="ms-title-icon__title" title={title} />
            {tooltip && icon && (
                <Tooltip className="ms-title-icon__icon" title={tooltip}>
                    {icon}
                </Tooltip>
            )}
        </div>
    );
};

export default TitleIcon;
