import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab } from '@/hooks';
import { TabPanel } from '@/components';
import { InteEntityType } from '../../hooks';
import Config from './config';
import Service from './service';

import './style.less';

type NSTabKey = 'config' | 'service';
type MscTabItem = {
    key: NSTabKey;
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
 * embedded NS integrated detail
 */
const NSContent: React.FC<IProps> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Tab ----------
    const tabs = useMemo<MscTabItem[]>(() => {
        return [
            {
                key: 'config',
                label: getIntlText('setting.integration.configuration'),
                component: <Config entities={entities} onUpdateSuccess={onUpdateSuccess} />,
            },
            // {
            //     key: 'service',
            //     label: getIntlText('setting.integration.service'),
            //     component: <Service entities={entities} onUpdateSuccess={onUpdateSuccess} />,
            // },
        ];
    }, [getIntlText, entities]);
    const [tabKey, setTabKey] = useRouteTab<NSTabKey>(tabs[0].key);

    return (
        <div className="ms-view ms-view-ns-detail">
            <Tabs className="ms-tabs" value={tabKey} onChange={(_, value) => setTabKey(value)}>
                {tabs.map(({ key, label }) => (
                    <Tab key={key} value={key} title={label} label={label} />
                ))}
            </Tabs>
            <div className="ms-tabs-content-ns">
                {tabs.map(({ key, component }) => (
                    <TabPanel value={tabKey} index={key} key={key}>
                        {component}
                    </TabPanel>
                ))}
            </div>
        </div>
    );
};

export default NSContent;
