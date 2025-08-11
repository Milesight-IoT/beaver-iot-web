import React from 'react';
import classNames from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { Typography } from '@mui/material';

import { type DeviceGroupItemProps } from '@/services/http/device';
import { PermissionControlHidden } from '@/components';
import { PERMISSIONS } from '@/constants';
import MoreDropdown, { MORE_OPERATION } from '../more-dropdown';
import { useBody } from './hooks/useBody';

import styles from './style.module.less';

export interface BodyProps {
    deviceGroups?: DeviceGroupItemProps[];
    onOperation?: (operation: MORE_OPERATION, record: DeviceGroupItemProps) => void;
}

/**
 * device group content
 */
const Body: React.FC<BodyProps> = props => {
    const { deviceGroups, onOperation } = props;
    const { data, activeGroup, handleGroupClick, hiddenMore, groupItemIcon } =
        useBody(deviceGroups);

    const groupItemCls = useMemoizedFn((currentItem: DeviceGroupItemProps) => {
        return classNames(styles.item, {
            [styles.active]: currentItem.id === activeGroup?.id,
        });
    });

    const renderGroupItem = (item: DeviceGroupItemProps) => {
        return (
            <div
                key={item.id}
                className={groupItemCls(item)}
                onClick={() => handleGroupClick(item)}
            >
                <div className={styles['name-wrapper']}>
                    <div className={styles.icon}>{groupItemIcon(item.id)}</div>

                    <Typography variant="inherit" noWrap title={item.name}>
                        {item.name}
                    </Typography>
                </div>

                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_GROUP_MANAGE}>
                    {!hiddenMore(item.id) && (
                        <MoreDropdown
                            isActive={item.id === activeGroup?.id}
                            onOperation={operation => onOperation?.(operation, item)}
                        />
                    )}
                </PermissionControlHidden>
            </div>
        );
    };

    return (
        <div className={`${styles.body} ms-perfect-scrollbar`}>
            {data.map(d => renderGroupItem(d))}
        </div>
    );
};

export default Body;
