import React from 'react';
import { Alert, IconButton } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    CheckCircleOutlineIcon,
    DeviceThermostatIcon,
    WaterDropIcon,
    OfflineBoltIcon,
    LocationOnIcon,
    NearMeIcon,
    DeleteOutlineIcon,
} from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type DeviceDetail } from '@/services/http';

import styles from './style.module.less';

export interface DevicePopupProps {
    device?: DeviceDetail;
}

const DevicePopup: React.FC<DevicePopupProps> = props => {
    const { device } = props;

    const { getIntlText } = useI18n();

    const openGoogleMap = useMemoizedFn(() => {
        if (!device?.location) {
            return;
        }

        const url = `https://www.google.com/maps?q=${device.location.latitude},${device.location.longitude}`;
        window.open(url, '_blank');
    });

    return (
        <div className={styles['device-popup']}>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={`${styles.status} ${styles.online}`} />
                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                        }}
                        className={styles.name}
                        autoEllipsis
                        title={device?.name || ''}
                    />
                </div>
                <div className={styles.right}>
                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                            sx: {
                                minWidth: 'max-content',
                            },
                        }}
                        title={getIntlText('dashboard.tip.delete_spot')}
                    >
                        <IconButton
                            sx={{
                                width: '24px',
                                height: '24px',
                            }}
                            size="small"
                        >
                            <DeleteOutlineIcon
                                sx={{ color: 'text.secondary', width: '16px', height: '16px' }}
                            />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <Tooltip
                PopperProps={{
                    disablePortal: true,
                }}
                className={styles.identify}
                autoEllipsis
                title={device?.identifier || ''}
            />
            <Alert
                icon={false}
                severity="error"
                action={
                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                            sx: {
                                minWidth: 'max-content',
                            },
                        }}
                        title={getIntlText('common.tip.click_to_claim')}
                    >
                        <IconButton
                            sx={{
                                width: '24px',
                                height: '24px',
                                '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                    color: 'inherit',
                                },
                            }}
                            color="inherit"
                            size="small"
                        >
                            <CheckCircleOutlineIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                }
                sx={{
                    '&.MuiAlert-root': {
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        marginBottom: 0,
                    },
                    '.MuiAlert-message': {
                        paddingTop: 0,
                        paddingBottom: 0,
                        fontSize: '0.75rem',
                        lineHeight: '1.25rem',
                        overflow: 'unset',
                    },
                    '.MuiAlert-action': {
                        paddingTop: 0,
                    },
                }}
            >
                <Tooltip
                    PopperProps={{
                        disablePortal: true,
                    }}
                    autoEllipsis
                    title="Abnormal soil conditions at the site at the site at the site."
                />
            </Alert>
            <div className={styles.info}>
                <div className={styles['info-item']}>
                    <DeviceThermostatIcon
                        sx={{
                            color: 'text.secondary',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                    <div className={styles['info-item__name']}>24%</div>
                </div>
                <div className={styles['info-item']}>
                    <WaterDropIcon
                        sx={{
                            color: 'text.secondary',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                    <div className={styles['info-item__name']}>67%</div>
                </div>
                <div className={styles['info-item']}>
                    <OfflineBoltIcon
                        sx={{
                            color: 'text.secondary',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                    <div className={styles['info-item__name']}>0.68</div>
                </div>
            </div>
            <div className={styles['info-item']}>
                <LocationOnIcon
                    sx={{
                        color: 'text.secondary',
                        width: '16px',
                        height: '16px',
                    }}
                />
                <div
                    className={styles['info-item__name']}
                >{`${device?.location?.latitude || ''}, ${device?.location?.longitude || ''}`}</div>
                <Tooltip
                    PopperProps={{
                        disablePortal: true,
                        sx: {
                            minWidth: 'max-content',
                        },
                    }}
                    title={getIntlText('dashboard.tip.navigate_here')}
                >
                    <IconButton sx={{ paddingLeft: '4px' }} size="small" onClick={openGoogleMap}>
                        <NearMeIcon
                            color="primary"
                            sx={{
                                width: '16px',
                                height: '16px',
                            }}
                        />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
};

export default DevicePopup;
