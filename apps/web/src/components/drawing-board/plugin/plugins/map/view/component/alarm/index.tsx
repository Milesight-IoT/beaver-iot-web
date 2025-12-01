import React, { useContext } from 'react';

import { useI18n } from '@milesight/shared/src/hooks';
import { LocationOnIcon } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { MapContext } from '../../context';

import styles from './style.module.less';

const Alarm: React.FC = () => {
    const { getIntlText } = useI18n();
    const mapContext = useContext(MapContext);
    const { getNoOnlineDevicesCount, getAlarmDevicesCount } = mapContext || {};

    return (
        <div className={styles.alarm}>
            <Tooltip title={getIntlText('dashboard.tip.alarm_device')}>
                <LocationOnIcon color="error" sx={{ width: '16px', height: '16px' }} />
            </Tooltip>
            <div className={`${styles.text} pe-3`}>{getAlarmDevicesCount?.() || 0}</div>
            <Tooltip title={getIntlText('dashboard.tip.offline_device')}>
                <LocationOnIcon
                    sx={{ width: '16px', height: '16px', color: 'var(--icon-color-gray-tertiary)' }}
                />
            </Tooltip>
            <div className={styles.text}>{getNoOnlineDevicesCount?.() || 0}</div>
        </div>
    );
};

export default Alarm;
