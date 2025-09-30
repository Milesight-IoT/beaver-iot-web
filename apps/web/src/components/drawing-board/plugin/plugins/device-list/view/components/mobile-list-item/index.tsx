import React, { useContext, useMemo } from 'react';
import { Stack, Button, Grid2 as Grid } from '@mui/material';
import { get, isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingButton } from '@milesight/shared/src/components';

import { Tooltip, DeviceStatus } from '@/components';
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

        return `${status.value}${entity?.value_attribute?.unit || ''}`;
    });

    const deviceStatus = useMemo(() => {
        return get(entitiesStatus, device?.deviceStatus?.id || '');
    }, [entitiesStatus, device]);

    return (
        <div
            className={cls(styles['mobile-list-item'], {
                [styles.search]: isSearchPage,
                [styles['none-border']]: isSearchPage || isFullscreen,
            })}
        >
            <div className={styles.title}>{device?.name || ''}</div>

            <Grid
                container
                spacing={1}
                sx={{
                    marginBottom: 2,
                }}
            >
                <Grid
                    size={4}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={getIntlText('device.label.param_external_id')} />
                </Grid>
                <Grid size={8}>
                    <Tooltip autoEllipsis title={device?.identifier || '-'} />
                </Grid>

                <Grid
                    size={4}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={device?.deviceStatus?.name || '-'} />
                </Grid>
                <Grid size={8}>
                    <DeviceStatus type={deviceStatus?.value} />
                </Grid>

                <Grid
                    size={4}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={device?.propertyEntityFirst?.name || '-'} />
                </Grid>
                <Grid size={8}>
                    <Tooltip autoEllipsis title={getStatus(device?.propertyEntityFirst)} />
                </Grid>

                <Grid
                    size={4}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={device?.propertyEntitySecond?.name || '-'} />
                </Grid>
                <Grid size={8}>
                    <Tooltip autoEllipsis title={getStatus(device?.propertyEntitySecond)} />
                </Grid>
            </Grid>

            <Stack
                direction="row"
                spacing="12px"
                sx={{
                    justifyContent: 'flex-end',
                    '.ms-tooltip': {
                        width: '100%',
                    },
                }}
            >
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={() => handleServiceClick?.(device?.serviceEntities?.[0])}
                >
                    <Tooltip autoEllipsis title={device?.serviceEntities?.[0]?.name || '-'} />
                </Button>

                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={() => handleServiceClick?.(device?.serviceEntities?.[1])}
                >
                    <Tooltip autoEllipsis title={device?.serviceEntities?.[1]?.name || '-'} />
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
