import React from 'react';
import { Checkbox, IconButton } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    LoadingWrapper,
    UncheckedCheckboxIcon,
    CheckedCheckboxIcon,
    ArrowForwardIosIcon,
} from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type DeviceGroupItemProps } from '@/services/http';
import { useDeviceGroup } from './useDeviceGroup';

import styles from './style.module.less';

/**
 * Device Group component
 */
const DeviceGroup: React.FC = () => {
    const { getIntlText } = useI18n();
    const {
        deviceGroups,
        devicesLoading,
        isDisabledChecked,
        isChecked,
        isIndeterminate,
        handleCheckedChange,
    } = useDeviceGroup();

    const renderCheckbox = (item: DeviceGroupItemProps) => {
        const disabled = isDisabledChecked(item);

        const CheckboxNode = (
            <Checkbox
                icon={<UncheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />}
                checkedIcon={<CheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />}
                disabled={disabled}
                indeterminate={isIndeterminate(item)}
                checked={isChecked(item)}
                sx={{
                    padding: 0,
                    color: 'var(--text-color-tertiary)',
                }}
                onChange={(_, checked) => handleCheckedChange(checked, item)}
            />
        );

        if (disabled) {
            return (
                <Tooltip title={getIntlText('common.tip.cannot_selected')}>
                    <div>{CheckboxNode}</div>
                </Tooltip>
            );
        }

        return CheckboxNode;
    };

    const renderItem = (item: DeviceGroupItemProps) => {
        return (
            <div key={item.id} className={styles.item}>
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
        <LoadingWrapper loading={devicesLoading}>
            <div className={styles['device-group']}>{deviceGroups.map(g => renderItem(g))}</div>
        </LoadingWrapper>
    );
};

export default DeviceGroup;
