import React, { useContext } from 'react';
import { Stack, Button } from '@mui/material';
import { get, isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingButton } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type ImportEntityProps } from '@/services/http';
import { type TableRowDataType } from '../../hooks';
import { DeviceListContext } from '../../context';

import styles from './style.module.less';

export interface MobileListItemProps {
    device?: TableRowDataType;
    isSearchPage?: boolean;
    isFullscreen?: boolean;
}

const MobileListItem: React.FC<MobileListItemProps> = props => {
    const { device, isSearchPage, isFullscreen } = props;
    const context = useContext(DeviceListContext);
    const {
        loadingDeviceDrawingBoard,
        entitiesStatus,
        handleDeviceDrawingBoard,
        handleServiceClick,
    } = context || {};

    const { getIntlText } = useI18n();

    const getStatus = useMemoizedFn((entity?: ImportEntityProps) => {
        if (!entity) {
            return '-';
        }

        const status = get(entitiesStatus, entity?.id || '');
        if (isNil(status?.value)) {
            return '-';
        }

        return status.value;
    });

    return (
        <div
            className={cls(styles['mobile-list-item'], {
                [styles.search]: isSearchPage,
                [styles['none-border']]: isSearchPage || isFullscreen,
            })}
        >
            <div className={styles.title}>{device?.name || ''}</div>

            <div className={styles.body}>
                <div className={styles.left}>
                    <Tooltip
                        className={styles.name}
                        autoEllipsis
                        title={getIntlText('device.label.param_external_id')}
                    />
                    <Tooltip
                        className={styles.name}
                        autoEllipsis
                        title={device?.deviceStatus?.name || '-'}
                    />
                    <Tooltip
                        className={styles.name}
                        autoEllipsis
                        title={device?.propertyEntityFirst?.name || '-'}
                    />
                    <Tooltip
                        className={styles.name}
                        autoEllipsis
                        title={device?.propertyEntitySecond?.name || '-'}
                    />
                </div>
                <div className={styles.right}>
                    <Tooltip
                        className={styles.value}
                        autoEllipsis
                        title={device?.identifier || '-'}
                    />
                    <Tooltip className={styles.value} autoEllipsis title="在线" />
                    <Tooltip
                        className={styles.value}
                        autoEllipsis
                        title={getStatus(device?.propertyEntityFirst)}
                    />
                    <Tooltip
                        className={styles.value}
                        autoEllipsis
                        title={getStatus(device?.propertyEntitySecond)}
                    />
                </div>
            </div>

            <Stack direction="row" spacing="12px" sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={() => handleServiceClick?.(device?.serviceEntities?.[0])}
                >
                    {device?.serviceEntities?.[0]?.name || '-'}
                </Button>

                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={() => handleServiceClick?.(device?.serviceEntities?.[1])}
                >
                    {device?.serviceEntities?.[1]?.name || '-'}
                </Button>

                <LoadingButton
                    loading={get(loadingDeviceDrawingBoard, String(device?.id || ''), false)}
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={() => handleDeviceDrawingBoard?.(device?.id)}
                >
                    {getIntlText('common.label.detail')}
                </LoadingButton>
            </Stack>
        </div>
    );
};

export default MobileListItem;
