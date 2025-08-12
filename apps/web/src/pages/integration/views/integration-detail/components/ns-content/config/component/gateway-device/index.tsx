import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import { GatewayDetailType, embeddedNSApi } from '@/services/http';
import SyncedDevices from './component/sync-device';
import SyncAbleDevice from './component/sync-able-device';
import { useControllerReq } from './hooks';

import './style.less';

interface IProps {
    visible: boolean;
    gatewayInfo: ObjectToCamelCase<GatewayDetailType>;
    onCancel: () => void;
    onUpdateSuccess?: () => void;
    refreshTable: () => void;
}

// gateway devices
const GatewayDevices: React.FC<IProps> = props => {
    const { visible, gatewayInfo, onCancel, onUpdateSuccess, refreshTable } = props;
    const { getIntlText } = useI18n();
    const [activeTap, setActiveTap] = useState<number>(0);
    const {
        data: syncedDevices,
        loading: syncedLoading,
        getList: reqSyncedDevices,
        resetList: resetSyncedDevices,
    } = useControllerReq();
    const {
        data: syncAbleDevices,
        loading: syncAbleLoading,
        getList: reqSyncAbleDevices,
        resetList: resetSyncAbleDevices,
    } = useControllerReq();

    const getSyncedDevices = useCallback(
        (reset: boolean = false) => {
            reqSyncedDevices(
                ({ signal }) =>
                    embeddedNSApi.getSyncedDevices({ eui: gatewayInfo.eui }, { signal }),
                reset,
            );
        },
        [reqSyncedDevices],
    );

    const getSyncAbleDevices = useCallback(
        (reset: boolean = false) => {
            reqSyncAbleDevices(
                ({ signal }) =>
                    embeddedNSApi.getSyncAbleDevices({ eui: gatewayInfo.eui }, { signal }),
                reset,
            );
        },
        [reqSyncAbleDevices],
    );

    useEffect(() => {
        resetSyncAbleDevices();
        resetSyncedDevices();
    }, [activeTap]);

    // change tab
    const handleChangeTap = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTap(newValue);
    };

    // tabs list
    const tabs = useMemo(() => {
        return [
            {
                id: getIntlText('setting.integration.label.synced_device'),
                label: getIntlText('setting.integration.label.synced_device'),
                component: (
                    <SyncedDevices
                        gatewayInfo={gatewayInfo}
                        refreshTable={refreshTable}
                        onUpdateSuccess={onUpdateSuccess}
                        getDevicesList={getSyncedDevices}
                        devicesData={syncedDevices}
                        loading={syncedLoading}
                    />
                ),
            },
            {
                id: getIntlText('setting.integration.label.syncable_device'),
                label: getIntlText('setting.integration.label.syncable_device'),
                component: (
                    <SyncAbleDevice
                        gatewayInfo={gatewayInfo}
                        onUpdateSuccess={onUpdateSuccess}
                        refreshTable={refreshTable}
                        getDevicesList={getSyncAbleDevices}
                        devicesData={syncAbleDevices}
                        loading={syncAbleLoading}
                    />
                ),
            },
        ];
    }, [getIntlText, gatewayInfo, syncAbleDevices, getSyncAbleDevices]);

    return (
        <Modal
            size="xl"
            visible={visible}
            className="ms-gateway-device-modal"
            footer={null}
            showCloseIcon
            onCancel={onCancel}
            title={
                <Tabs value={activeTap} onChange={handleChangeTap}>
                    {tabs.map(props => (
                        <Tab key={props.label} id={props.id} label={props.label} />
                    ))}
                </Tabs>
            }
            sx={{
                '& .MuiDialogContent-root': {
                    height: '700px',
                },
            }}
        >
            {tabs[activeTap].component}
        </Modal>
    );
};

export default GatewayDevices;
