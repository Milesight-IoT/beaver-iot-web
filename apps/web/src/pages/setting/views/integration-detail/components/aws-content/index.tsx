import { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useRouteTab } from '@/hooks';
import { TabPanel } from '@/components';
import { type InteEntityType } from '../../hooks';
import Config from './config';
import Functions from './functions';
import Products from './products';
import Plugins from './plugins';

type MscTabKey = 'config' | 'function' | 'products' | 'plugins';
type MscTabItem = {
    key: MscTabKey;
    label: string;
    component: React.ReactNode;
};

interface Props {
    /** 实体列表 */
    entities?: InteEntityType[];

    /** 编辑成功回调 */
    onUpdateSuccess?: () => void;
}

/**
 * AWS 集成定制详情内容
 */
const MscContent: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Tab 相关逻辑 ----------
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
            {
                key: 'product',
                label: getIntlText('setting.integration.available_product'),
                component: <Products/>,
            },
            {
                key: 'plugin',
                label: getIntlText('setting.integration.available_plugin'),
                component: <Plugins/>,
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
