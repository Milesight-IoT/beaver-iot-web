import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeviceStatus as DeviceStatusType } from '@/services/http';
import './style.less';

interface Props {
    /** Status Type */
    type?: DeviceStatusType;
}

/**
 * Device Status Component
 */
export const DeviceStatus: React.FC<Props> = memo(({ type }) => {
    const { getIntlHtml } = useI18n();
    const label = useMemo(() => {
        switch (type) {
            case 'ONLINE': {
                return getIntlHtml('common.label.online');
            }
            case 'OFFLINE': {
                return getIntlHtml('common.label.offline');
            }
            default: {
                return '';
            }
        }
    }, [type, getIntlHtml]);

    return !type ? (
        '-'
    ) : (
        <Chip
            className={`ms-device-status-chip ms-device-status-chip__${type.toLocaleLowerCase()}`}
            label={label}
        />
    );
});
