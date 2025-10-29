import React from 'react';

import { useI18n } from '@milesight/shared/src/hooks';
import { LocationOnIcon } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';

import styles from './style.module.less';

const Alarm: React.FC = () => {
    const { getIntlText } = useI18n();

    return (
        <div className={styles.alarm}>
            <Tooltip title={getIntlText('dashboard.tip.alarm_device')}>
                <LocationOnIcon color="error" sx={{ width: '16px', height: '16px' }} />
            </Tooltip>
            <div className={`${styles.text} pe-3`}>1</div>
            <Tooltip title={getIntlText('dashboard.tip.offline_device')}>
                <LocationOnIcon color="disabled" sx={{ width: '16px', height: '16px' }} />
            </Tooltip>
            <div className={styles.text}>0</div>
        </div>
    );
};

export default Alarm;
