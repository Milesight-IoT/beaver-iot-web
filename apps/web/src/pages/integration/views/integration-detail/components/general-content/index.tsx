import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab } from '@/hooks';
import { TabPanel } from '@/components';
import { type InteEntityType } from '../../hooks';
import Property from './property';
import Service from './service';
import './style.less';

type GeneralTabKey = 'property' | 'service';
type GeneralTabItem = {
    key: GeneralTabKey;
    label: string;
    component: React.ReactNode;
};

interface Props {
    /** Loading or not */
    loading?: boolean;

    /** Entity list */
    entities?: InteEntityType[];

    /** Service Entity Key that the page does not render */
    excludeServiceKeys?: ApiKey[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * Common integration details content
 */
const GeneralContent: React.FC<Props> = ({
    loading,
    entities,
    excludeServiceKeys,
    onUpdateSuccess,
}) => {
    const { getIntlText } = useI18n();

    // ---------- Tab related logic ----------
    const tabs = useMemo<GeneralTabItem[]>(() => {
        return [
            {
                key: 'property',
                label: getIntlText('common.label.property'),
                component: (
                    <Property
                        loading={loading}
                        entities={entities}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                ),
            },
            {
                key: 'service',
                label: getIntlText('common.label.service'),
                component: (
                    <Service
                        loading={loading}
                        entities={entities}
                        excludeKeys={excludeServiceKeys}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                ),
            },
        ];
    }, [entities, loading, excludeServiceKeys, getIntlText, onUpdateSuccess]);
    const [tabKey, setTabKey] = useRouteTab<GeneralTabKey>(tabs[0].key);

    return (
        <>
            <Tabs className="ms-tabs" value={tabKey} onChange={(_, value) => setTabKey(value)}>
                {tabs.map(({ key, label }) => (
                    <Tab key={key} value={key} title={label} label={label} />
                ))}
            </Tabs>
            <div className="ms-tabs-content ms-inte-detail-general">
                {tabs.map(({ key, component }) => (
                    <TabPanel value={tabKey} index={key} key={key}>
                        {component}
                    </TabPanel>
                ))}
            </div>
        </>
    );
};

export default GeneralContent;
