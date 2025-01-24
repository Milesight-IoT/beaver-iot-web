import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab } from '@/hooks';
import { TabPanel } from '@/components';
import { type InteEntityType } from '../../hooks';
import Config from './config';
import Functions from './functions';

type MscTabKey = 'config' | 'function';
type MscTabItem = {
    key: MscTabKey;
    label: string;
    component: React.ReactNode;
};

interface Props {
    /** Entity list */
    entities?: InteEntityType[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * MSC integrated custom details
 */
const MscContent: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Tab related logic ----------
    const tabs = useMemo<MscTabItem[]>(() => {
        return [
            {
                key: 'config',
                label: getIntlText('setting.integration.configuration'),
                component: <Config entities={entities} onUpdateSuccess={onUpdateSuccess} />,
            },
            {
                key: 'function',
                label: getIntlText('setting.integration.available_function'),
                component: <Functions entities={entities} />,
            },
        ];
    }, [entities, getIntlText, onUpdateSuccess]);
    const [tabKey, setTabKey] = useRouteTab<MscTabKey>(tabs[0].key);

    return (
        <>
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
        </>
    );
};

export default MscContent;
