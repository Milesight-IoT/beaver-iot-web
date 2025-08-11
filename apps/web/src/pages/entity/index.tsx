import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab, useUserPermissions } from '@/hooks';
import { Breadcrumbs, TabPanel } from '@/components';
import { PERMISSIONS } from '@/constants';
import CustomEntity from './components/custom-entity';
import Entity from './components/entity';
import './style.less';

export default () => {
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();

    const tabs = useMemo(() => {
        return [
            {
                key: 'entity-data',
                label: getIntlText('device.detail.entity_data'),
                component: <Entity />,
                permission: PERMISSIONS.ENTITY_DATA_MODULE,
            },
            {
                key: 'custom-entity',
                label: getIntlText('entity.label.custom_entity'),
                component: <CustomEntity />,
                permission: PERMISSIONS.ENTITY_CUSTOM_MODULE,
            },
        ].filter(t => hasPermission(t.permission));
    }, [getIntlText, hasPermission]);

    const [tabKey, setTabKey] = useRouteTab(tabs?.[0]?.key || 'entity-data');

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-entity">
                <div className="topbar">
                    <Tabs
                        className="ms-tabs"
                        value={tabKey}
                        onChange={(_, value) => setTabKey(value)}
                    >
                        {tabs.map(({ key, label }) => (
                            <Tab disableRipple key={key} value={key} title={label} label={label} />
                        ))}
                    </Tabs>
                </div>
                <div className="ms-tab-content">
                    {tabs.map(({ key, component }) => (
                        <TabPanel value={tabKey} index={key} key={key}>
                            {component}
                        </TabPanel>
                    ))}
                </div>
            </div>
        </div>
    );
};
