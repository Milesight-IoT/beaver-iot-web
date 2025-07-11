import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab } from '@/hooks';
import { TabPanel } from '@/components';
import { InteEntityType } from '../../hooks';
import Config from './config';
import Service from './service';
import DeviceBind from './device-bind';

import './style.less';

type TabKey = 'config' | 'service' | 'device';
type TabItem = {
    key: TabKey;
    label: string;
    component: React.ReactNode;
};

interface IProps {
    /** Loading or not */
    loading?: boolean;
    /** Service Entity Key that the page does not render */
    excludeServiceKeys?: ApiKey[];
    /** Entity list */
    entities?: InteEntityType[];
    /** Edit successful callback */
    onUpdateSuccess?: (
        successCb?: (entityList?: InteEntityType[], excludeKeys?: ApiKey[]) => void,
    ) => void;
}

/**
 * ai integrate detail
 */
const AiContent: React.FC<IProps> = ({
    loading,
    entities,
    onUpdateSuccess,
    excludeServiceKeys,
}) => {
    const { getIntlText } = useI18n();

    // ---------- Tab ----------
    const tabs = useMemo<TabItem[]>(() => {
        return [
            {
                key: 'config',
                label: getIntlText('setting.integration.configuration'),
                component: <Config entities={entities} onUpdateSuccess={onUpdateSuccess} />,
            },
            {
                key: 'service',
                label: getIntlText('setting.integration.service_manage'),
                component: (
                    <Service
                        loading={loading}
                        entities={entities}
                        excludeKeys={excludeServiceKeys}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                ),
            },
            {
                key: 'device',
                label: getIntlText('setting.integration.device_bind'),
                component: (
                    <DeviceBind
                        entities={entities}
                        excludeKeys={excludeServiceKeys}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                ),
            },
        ];
    }, [getIntlText, entities, onUpdateSuccess, loading, excludeServiceKeys]);
    const [tabKey, setTabKey] = useRouteTab<TabKey>(tabs[0].key);

    return (
        <div className="ms-view ms-view-ai">
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

export default AiContent;
