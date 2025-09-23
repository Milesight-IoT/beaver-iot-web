import React from 'react';
import classNames from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';

import './style.less';

interface IProps {
    status: 'ONLINE' | 'OFFLINE';
}

const STATUS_INTL_KEY = {
    ONLINE: 'common.label.online',
    OFFLINE: 'common.label.offline',
};

// gateway status
const GatewayStatus: React.FC<IProps> = props => {
    const { status } = props;
    const { getIntlText } = useI18n();

    return (
        <div
            className={classNames('ms-view-gateway-status', {
                'ms-view-gateway-status-online': status === 'ONLINE',
                'ms-view-gateway-status-offline': status === 'OFFLINE',
            })}
        >
            {getIntlText(STATUS_INTL_KEY[status])}
        </div>
    );
};

export default GatewayStatus;
