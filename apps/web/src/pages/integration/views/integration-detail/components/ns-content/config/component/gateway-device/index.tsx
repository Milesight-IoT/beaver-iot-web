import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tab, Tabs } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import { awaitWrap, getResponseData, embeddedNSApi, GatewayDetailType } from '@/services/http';
import SyncedDevices from './component/sync-device';
import SyncAbleDevice from './component/sync-able-device';

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
    // sync able device count
    const [syncAbleCount, setSyncAbleCount] = useState<number>(0);

    useEffect(() => {
        getSyncAbleDevices();
    }, []);

    // init syncable devices count
    const getSyncAbleDevices = async () => {
        const [error, resp] = await awaitWrap(
            embeddedNSApi.getSyncAbleDevices({
                eui: gatewayInfo.eui,
            }),
        );
        if (!error && resp) {
            const data = getResponseData(resp);
            setSyncAbleCount(data?.length || 0);
        }
    };

    // change tab
    const handleChangeTap = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTap(newValue);
    };

    // onchange syncAble device count
    const onSyncAbleCountChange = (count: number) => {
        setSyncAbleCount(count);
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
                    />
                ),
            },
            {
                id: getIntlText('setting.integration.label.syncable_device'),
                label: getIntlText('setting.integration.label.syncable_device', {
                    1: syncAbleCount,
                }),
                component: (
                    <SyncAbleDevice
                        gatewayInfo={gatewayInfo}
                        deviceCountChange={onSyncAbleCountChange}
                        onUpdateSuccess={onUpdateSuccess}
                        refreshTable={refreshTable}
                    />
                ),
            },
        ];
    }, [getIntlText, gatewayInfo, syncAbleCount]);

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
