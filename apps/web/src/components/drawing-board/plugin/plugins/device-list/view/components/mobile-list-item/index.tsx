import React, { useContext, useMemo } from 'react';
import { Stack, Button, Grid2 as Grid, IconButton } from '@mui/material';
import { get, isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingWrapper, ArrowForwardIosIcon } from '@milesight/shared/src/components';

import { Tooltip, DeviceStatus } from '@/components';
import { type ImportEntityProps } from '@/services/http';
import { getIEntityEnumDisplayVal } from '@/utils';
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

        return getIEntityEnumDisplayVal(status.value, entity);
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
            <LoadingWrapper
                loading={get(loadingDeviceDrawingBoard, String(device?.id || ''), false)}
            >
                <div onClick={() => handleDeviceDrawingBoard?.(device?.id)}>
                    <div className={styles.header}>
                        <Tooltip className={styles.title} autoEllipsis title={device?.name || ''} />
                        <IconButton>
                            <ArrowForwardIosIcon sx={{ width: '0.75rem', height: '0.75rem' }} />
                        </IconButton>
                    </div>

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
                            <Tooltip
                                autoEllipsis
                                title={getIntlText('device.label.param_external_id')}
                            />
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
                            <Tooltip
                                autoEllipsis
                                title={getIntlText('device.title.device_status')}
                            />
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
                            <Tooltip
                                autoEllipsis
                                title={device?.propertyEntityFirst?.name || '-'}
                            />
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
                            <Tooltip
                                autoEllipsis
                                title={device?.propertyEntitySecond?.name || '-'}
                            />
                        </Grid>
                        <Grid size={8}>
                            <Tooltip autoEllipsis title={getStatus(device?.propertyEntitySecond)} />
                        </Grid>
                    </Grid>
                </div>
            </LoadingWrapper>
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

                {/* <LoadingWrapper
                    size={20}
                    loading={get(loadingDeviceDrawingBoard, String(device?.id || ''), false)}
                >
                    <Button
                        variant="outlined"
                        sx={{ height: 36, textTransform: 'none' }}
                        onClick={() => handleDeviceDrawingBoard?.(device?.id)}
                    >
                        {getIntlText('common.label.detail')}
                    </Button>
                </LoadingWrapper> */}
            </Stack>
        </div>
    );
};

export default MobileListItem;
