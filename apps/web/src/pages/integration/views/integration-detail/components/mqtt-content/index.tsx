import { useEffect, useMemo, useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab } from '@/hooks';
import { TabPanel } from '@/components';
import {
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    mqttApi,
    MqttBrokerInfoType,
} from '@/services/http';
import { InteEntityType } from '../../hooks';
import Config from './config';
import Service from './template';

import './style.less';

type TabKey = 'config' | 'template';
type TabItem = {
    key: TabKey;
    label: string;
    component: React.ReactNode;
};

interface IProps {
    /** Entity list */
    entities?: InteEntityType[];
    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * mqtt integrate detail
 */
const MqttContent: React.FC<IProps> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const [brokerInfo, setBrokerInfo] = useState<MqttBrokerInfoType>();

    useEffect(() => {
        if (!entities) {
            return;
        }
        getMqttBrokerInfo();
    }, [entities]);

    const getMqttBrokerInfo = async () => {
        const [error, resp] = await awaitWrap(mqttApi.getBrokerInfo());
        const data = getResponseData(resp);
        if (error || !data || !isRequestSuccess(resp)) {
            return;
        }
        if (!data.server) {
            data.server = location.hostname;
        }
        setBrokerInfo(data);
    };

    // ---------- Tab ----------
    const tabs = useMemo<TabItem[]>(() => {
        return [
            {
                key: 'config',
                label: getIntlText('setting.integration.configuration'),
                component: (
                    <Config
                        entities={entities}
                        brokerInfo={brokerInfo}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                ),
            },
            {
                key: 'template',
                label: getIntlText('setting.integration.device_template'),
                component: (
                    <Service
                        entities={entities}
                        brokerInfo={brokerInfo}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                ),
            },
        ];
    }, [getIntlText, entities, brokerInfo]);
    const [tabKey, setTabKey] = useRouteTab<TabKey>(tabs[0].key);

    return (
        <div className="ms-view ms-view-mqtt">
            <Tabs className="ms-tabs" value={tabKey} onChange={(_, value) => setTabKey(value)}>
                {tabs.map(({ key, label }) => (
                    <Tab key={key} value={key} title={label} label={label} />
                ))}
            </Tabs>
            <div className="ms-tabs-content">
                {tabs.map(({ key, component }) => (
                    <TabPanel value={tabKey} index={key} key={key}>
                        {component}
                    </TabPanel>
                ))}
            </div>
        </div>
    );
};

export default MqttContent;
