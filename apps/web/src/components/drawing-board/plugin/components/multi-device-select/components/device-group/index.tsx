import React from 'react';
import { IconButton } from '@mui/material';

import { LoadingWrapper, ArrowForwardIosIcon } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type DeviceGroupItemProps } from '@/services/http';
import useMultiDeviceSelectStore from '../../store';
import { useCheckbox } from './useCheckbox';

import styles from './style.module.less';

export interface DeviceGroupProps {
    loading?: boolean;
}

/**
 * Device Group component
 */
const DeviceGroup: React.FC<DeviceGroupProps> = props => {
    const { loading } = props;

    const { deviceGroups, updateSelectedGroup } = useMultiDeviceSelectStore();
    const { devicesLoading, renderCheckbox } = useCheckbox();

    const renderItem = (item: DeviceGroupItemProps) => {
        return (
            <div key={item.id} className={styles.item} onClick={() => updateSelectedGroup(item)}>
                {renderCheckbox(item)}
                <div className={styles.name}>
                    <Tooltip autoEllipsis title={item.name} />
                </div>
                <div className={styles.count}>{item.device_count}</div>
                <div className={styles.icon}>
                    <IconButton>
                        <ArrowForwardIosIcon sx={{ width: '10px', height: '10px' }} />
                    </IconButton>
                </div>
            </div>
        );
    };

    return (
        <div className={styles['device-group']}>
            <LoadingWrapper
                wrapperClassName={styles['device-group__loading']}
                loading={loading || devicesLoading}
            >
                <div className={styles['device-group__container']}>
                    {deviceGroups.map(g => renderItem(g))}
                </div>
            </LoadingWrapper>
        </div>
    );
};

export default DeviceGroup;
