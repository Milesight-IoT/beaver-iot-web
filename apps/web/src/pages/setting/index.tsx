import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab, useUserPermissions } from '@/hooks';
import { Breadcrumbs, TabPanel } from '@/components';
import { PERMISSIONS } from '@/constants';
import { Credential, WhiteLabel, Blueprint } from './components';

import './style.less';

/**
 * credentials component
 */
export default () => {
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();

    const tabs = useMemo(() => {
        return [
            {
                key: 'white-label',
                label: getIntlText('setting.credentials.white_label'),
                component: <WhiteLabel />,
                permission: PERMISSIONS.SETTING_MODULE,
            },
            {
                key: 'credential',
                label: getIntlText('setting.integration.label.credential'),
                component: <Credential />,
                permission: PERMISSIONS.CREDENTIAL_MODULE,
            },
            {
                key: 'blueprint',
                label: getIntlText('setting.blueprint.management_title'),
                component: <Blueprint />,
                permission: PERMISSIONS.CREDENTIAL_MODULE,
            },
        ].filter(t => hasPermission(t.permission));
    }, [getIntlText, hasPermission]);

    const [tabKey, setTabKey] = useRouteTab(tabs?.[0]?.key || 'white-label');

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-credentials">
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
