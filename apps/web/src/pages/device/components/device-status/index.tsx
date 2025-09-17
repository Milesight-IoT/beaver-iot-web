import React, { memo } from 'react';
import { Chip } from '@mui/material';
import './style.less';

/**
 * Device Status
 * @template online
 * @template offline
 */
export type DeviceStatus = 'online' | 'offline';

interface Props {
    /** Status Type */
    type?: DeviceStatus;
}

/**
 * Device Status Component
 */
export const DeviceStatus: React.FC<Props> = memo(({ type }) => {
    return (
        <Chip
            className={`ms-device-status-chip ms-device-status-chip__${type}`}
            // TODO: I18N
            label={type === 'online' ? 'Online' : 'Offline'}
        />
    );
});
