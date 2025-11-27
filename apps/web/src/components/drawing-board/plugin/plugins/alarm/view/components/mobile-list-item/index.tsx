import React from 'react';
import { Stack, Button, Grid2 as Grid } from '@mui/material';
import cls from 'classnames';
import { get, isNil } from 'lodash-es';

import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    NearMeOutlinedIcon,
    CheckCircleOutlineIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { openGoogleMap } from '@/components/drawing-board/plugin/utils';
import { type TableRowDataType, useAlarmClaim } from '../../hooks';
import ClaimChip from '../claim-chip';

import styles from './style.module.less';

export interface MobileListItemProps {
    device?: TableRowDataType;
    isSearchPage?: boolean;
    isFullscreen?: boolean;
    refreshList?: () => void;
}

const MobileListItem: React.FC<MobileListItemProps> = props => {
    const { device, isSearchPage, isFullscreen, refreshList } = props;

    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();
    const { claimAlarm, claimLoading } = useAlarmClaim(refreshList);

    return (
        <div
            className={cls(styles['mobile-list-item'], {
                [styles.search]: isSearchPage,
                [styles['none-border']]: isSearchPage || isFullscreen,
            })}
        >
            <div className={styles.header}>
                <Tooltip className={styles.title} autoEllipsis title={device?.deviceName || ''} />
            </div>

            <Grid
                container
                spacing={1}
                sx={{
                    marginBottom: 2,
                }}
            >
                <Grid
                    size={3}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={getIntlText('device.title.device_status')} />
                </Grid>
                <Grid size={9}>
                    <ClaimChip unclaimed={!!device?.alarmStatus} />
                </Grid>

                <Grid
                    size={3}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={getIntlText('common.label.time')} />
                </Grid>
                <Grid size={9}>
                    <Tooltip
                        autoEllipsis
                        title={getTimeFormat(device?.alarmTime, 'fullDateTimeMinuteFormat')}
                    />
                </Grid>

                <Grid
                    size={3}
                    sx={{
                        color: 'var(--text-color-secondary)',
                    }}
                >
                    <Tooltip autoEllipsis title={getIntlText('common.label.content')} />
                </Grid>
                <Grid size={9} sx={{ minHeight: 66, wordBreak: 'break-all' }}>
                    {device?.alarmContent || ''}
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
                    disabled={isNil(device?.latitude) || isNil(device?.longitude)}
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<NearMeOutlinedIcon sx={{ width: '1.25rem', height: '1.25rem' }} />}
                    onClick={() => openGoogleMap(device?.latitude, device?.longitude)}
                >
                    <Tooltip autoEllipsis title={getIntlText('dashboard.tip.navigate_here')} />
                </Button>

                {!!device?.alarmStatus && (
                    <LoadingWrapper
                        size={20}
                        loading={get(claimLoading, String(device?.id), false)}
                    >
                        <Button
                            variant="contained"
                            sx={{ height: 36, textTransform: 'none' }}
                            startIcon={
                                <CheckCircleOutlineIcon
                                    sx={{ width: '1.25rem', height: '1.25rem' }}
                                />
                            }
                            onClick={() => claimAlarm(device?.deviceId, device?.id)}
                        >
                            <Tooltip autoEllipsis title={getIntlText('common.label.claim')} />
                        </Button>
                    </LoadingWrapper>
                )}
            </Stack>
        </div>
    );
};

export default MobileListItem;
