import React, { useMemo } from 'react';
import { isNil } from 'lodash-es';
import cls from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components';
import { basicNodeConfigs, LogStatusMap } from '@/pages/workflow/config';
import NodeAvatar from '@/pages/workflow/components/node-avatar';
import type { AccordionLog } from '../../types';
import './style.less';

interface IProps {
    data: AccordionLog;
}
export default React.memo(({ data }: IProps) => {
    const { getIntlText } = useI18n();

    /** Get the header render config */
    const {
        icon,
        iconBgColor,
        name,
        type,
        status = 'SUCCESS',
        timeCost,
        labelIntlKey,
    } = useMemo(() => {
        const { type, config, status, name, timeCost } = data || {};
        const { icon, iconBgColor, labelIntlKey } = config || {};
        const result = basicNodeConfigs[type];

        return {
            status,
            name,
            type,
            timeCost,
            icon: icon || result?.icon,
            iconBgColor: iconBgColor || result?.iconBgColor,
            labelIntlKey: labelIntlKey || result?.labelIntlKey,
        };
    }, [data]);

    /** Get this state render config */
    const { className: statusClassName, icon: statusIcon } = useMemo(
        () => LogStatusMap[status] || {},
        [status],
    );
    return (
        <div className="ms-accordion-header">
            <div className="ms-header-type">
                <NodeAvatar
                    name={name || ''}
                    type={type}
                    icon={icon}
                    iconBgColor={iconBgColor}
                    className="ms-header-type__avatar"
                />
                <div className="ms-header-type__name">
                    <Tooltip
                        autoEllipsis
                        title={(labelIntlKey && getIntlText(labelIntlKey)) || name || ''}
                    />
                </div>
            </div>
            {!isNil(timeCost) && (
                <div className="ms-header-ms">{`${timeCost}${getIntlText('common.label.ms')}`}</div>
            )}
            <div className={cls('ms-header-status', statusClassName)}>{statusIcon}</div>
        </div>
    );
});
