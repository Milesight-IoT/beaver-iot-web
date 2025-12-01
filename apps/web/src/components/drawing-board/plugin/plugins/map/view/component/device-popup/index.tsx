import React, { useContext } from 'react';
import { Alert, IconButton } from '@mui/material';
import { useDebounceFn } from 'ahooks';
import cls from 'classnames';
import { isEmpty, get } from 'lodash-es';

import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import {
    CheckCircleOutlineIcon,
    DeviceThermostatIcon,
    WaterDropIcon,
    OfflineBoltIcon,
    LocationOnIcon,
    NearMeIcon,
    DeleteOutlineIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type DeviceDetail } from '@/services/http';
import useControlPanelStore from '@/components/drawing-board/plugin/store';
import { type DeviceSelectData } from '@/components/drawing-board/plugin/components';
import { toSixDecimals, openGoogleMap } from '@/components/drawing-board/plugin/utils';
import { useAlarmClaim } from '@/components/drawing-board/plugin/plugins/alarm/view/hooks/useAlarmClaim';
import { MapContext } from '../../context';
import { useEntityStatus } from './useEntityStatus';

import styles from './style.module.less';

export interface DevicePopupProps {
    device?: DeviceDetail;
    closeMarkerPopup: (id: ApiKey) => void;
}

const DevicePopup: React.FC<DevicePopupProps> = props => {
    const { device, closeMarkerPopup } = props;

    const { getIntlText } = useI18n();
    const { formData, setValuesToFormConfig } = useControlPanelStore(
        useStoreShallow(['formData', 'setValuesToFormConfig']),
    );
    const mapContext = useContext(MapContext);
    const { isPreview, entitiesStatus, getDeviceStatus, getNewestEntitiesStatus } =
        mapContext || {};
    const { getDeviceLatitude, getDeviceLongitude, aStatus, temperature, moisture, conductivity } =
        useEntityStatus(entitiesStatus);
    const { claimLoading, claimAlarm } = useAlarmClaim(getNewestEntitiesStatus);

    const { run: handleDeleteSpot } = useDebounceFn(
        () => {
            if (!isPreview || !device) {
                return;
            }

            closeMarkerPopup(device.id);

            const { devices = [] } = formData || {};
            const selectDevices = devices as DeviceSelectData[];
            if (!Array.isArray(selectDevices) || isEmpty(selectDevices)) {
                return;
            }

            setValuesToFormConfig({
                devices: [...selectDevices.filter(d => d.id !== device.id)],
            });
        },
        {
            wait: 300,
        },
    );

    return (
        <div className={styles['device-popup']}>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div
                        className={cls(styles.status, {
                            [styles.online]: getDeviceStatus?.(device) === 'ONLINE',
                            [styles.offline]: getDeviceStatus?.(device) !== 'ONLINE',
                        })}
                    />
                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                        }}
                        className={styles.name}
                        autoEllipsis
                        title={device?.name || ''}
                    />
                </div>
                <div
                    className={cls(styles.right, {
                        'd-none': !isPreview,
                    })}
                >
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
                                color: 'text.secondary',
                                '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                    color: 'text.secondary',
                                },
                                '&.MuiIconButton-root:hover': {
                                    backgroundColor: 'var(--hover-background-1)',
                                    borderRadius: '50%',
                                },
                            }}
                            size="small"
                            onClick={handleDeleteSpot}
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
            {aStatus(device) && (
                <Alert
                    icon={false}
                    severity="error"
                    action={
                        !isPreview && (
                            <LoadingWrapper
                                size={16}
                                loading={get(claimLoading, String(device?.key), false)}
                            >
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
                                        onClick={() => claimAlarm(device?.id, device?.key)}
                                    >
                                        <CheckCircleOutlineIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </LoadingWrapper>
                        )
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
                        title={getIntlText('dashboard.tip.abnormal_soil_conditions')}
                    />
                </Alert>
            )}
            <div className={styles.info}>
                <div className={styles['info-item']}>
                    <DeviceThermostatIcon
                        sx={{
                            color: 'text.secondary',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                    <div className={styles['info-item__name']}>{temperature(device)}</div>
                </div>
                <div className={styles['info-item']}>
                    <WaterDropIcon
                        sx={{
                            color: 'text.secondary',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                    <div className={styles['info-item__name']}>{moisture(device)}</div>
                </div>
                <div className={styles['info-item']}>
                    <OfflineBoltIcon
                        sx={{
                            color: 'text.secondary',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                    <div className={styles['info-item__name']}>{conductivity(device)}</div>
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
                >{`${toSixDecimals(getDeviceLatitude(device))}, ${toSixDecimals(getDeviceLongitude(device))}`}</div>
                {!isPreview && (
                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                            sx: {
                                minWidth: 'max-content',
                            },
                        }}
                        title={getIntlText('dashboard.tip.navigate_here')}
                    >
                        <IconButton
                            sx={{ paddingLeft: '4px' }}
                            size="small"
                            onClick={() =>
                                openGoogleMap(
                                    device?.location?.latitude,
                                    device?.location?.longitude,
                                )
                            }
                        >
                            <NearMeIcon
                                color="primary"
                                sx={{
                                    width: '16px',
                                    height: '16px',
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};

export default DevicePopup;
