import React from 'react';
import { Alert, IconButton } from '@mui/material';

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

import styles from './style.module.less';

const DevicePopup: React.FC = () => {
    const { getIntlText } = useI18n();

    return (
        <div className={styles['device-popup']}>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={`${styles.status} ${styles.online}`} />
                    <Tooltip className={styles.name} autoEllipsis title="Device123" />
                </div>
                <div className={styles.right}>
                    <Tooltip title={getIntlText('dashboard.tip.delete_spot')}>
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
            <div className={styles.identify}>24E123456789</div>
            <Alert
                icon={false}
                severity="error"
                action={
                    <Tooltip title={getIntlText('common.tip.click_to_claim')}>
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
                    },
                    '.MuiAlert-action': {
                        paddingTop: 0,
                    },
                }}
            >
                <Tooltip
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
                <div className={styles['info-item__name']}>22.228671,25.121666</div>
                <Tooltip title={getIntlText('dashboard.tip.navigate_here')}>
                    <IconButton sx={{ paddingLeft: '4px' }} size="small">
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
