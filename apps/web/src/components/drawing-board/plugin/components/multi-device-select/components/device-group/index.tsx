import React from 'react';
import { IconButton } from '@mui/material';

import { LoadingWrapper, ArrowForwardIosIcon } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type DeviceGroupItemProps } from '@/services/http';
import { useDeviceGroup } from './useDeviceGroup';

import styles from './style.module.less';

/**
 * Device Group component
 */
const DeviceGroup: React.FC = () => {
    const { deviceGroups, devicesLoading, renderCheckbox, handleSelectGroup } = useDeviceGroup();

    const renderItem = (item: DeviceGroupItemProps) => {
        return (
            <div key={item.id} className={styles.item}>
                {renderCheckbox(item)}
                <div className={styles.name}>
                    <Tooltip autoEllipsis title={item.name} />
                </div>
                <div className={styles.count}>{item.device_count}</div>
                <div className={styles.icon} onClick={() => handleSelectGroup(item)}>
                    <IconButton>
                        <ArrowForwardIosIcon sx={{ width: '10px', height: '10px' }} />
                    </IconButton>
                </div>
            </div>
        );
    };

    return (
        <div className={styles['device-group']}>
            <LoadingWrapper loading={devicesLoading}>
                <div className={styles['device-group__container']}>
                    {deviceGroups.map(g => renderItem(g))}
                </div>
            </LoadingWrapper>
        </div>
    );
};

export default DeviceGroup;
