import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { Breadcrumbs, TabPanel } from '@/components';
import { useRouteTab } from '@/hooks';

import { UserView, RoleView } from './views';

import styles from './style.module.less';

/**
 * User Role Module
 */
function UserRole() {
    const { getIntlText } = useI18n();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    /**
     * Handle tabs data
     */
    const tabsData = useMemo(() => {
        return [
            {
                key: 'users',
                label: getIntlText('user.role.users_tab_name'),
                content: <UserView />,
            },
            {
                key: 'roles',
                label: getIntlText('user.role.roles_tab_name'),
                content: <RoleView />,
            },
        ];
    }, [getIntlText]);

    const [tab, setTab] = useRouteTab<string>(tabsData?.[0]?.key || 'users');

    const renderTabs = () => {
        return (
            <>
                <Tabs className="ms-tabs" value={tab} onChange={handleChange}>
                    {tabsData.map(item => (
                        <Tab disableRipple key={item.key} label={item.label} value={item.key} />
                    ))}
                </Tabs>
                <div className="ms-tab-content">
                    {tabsData.map(item => (
                        <TabPanel key={item.key} value={tab} index={item.key}>
                            {item.content}
                        </TabPanel>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className={`ms-view ${styles['user-role']}`}>{renderTabs()}</div>
        </div>
    );
}

export default UserRole;
