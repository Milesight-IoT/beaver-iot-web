// import { useState } from 'react';
// import { Tabs, Tab } from '@mui/material';
// import { useI18n } from '@milesight/shared/src/hooks';
import { Breadcrumbs, Map } from '@/components';
import { Integration } from './components';
import './style.less';

function IntegrationModule() {
    // const { getIntlText } = useI18n();
    // const [tab, setTab] = useState<ApiKey>('1');

    // const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    //     setTab(newValue);
    // };

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-integration">
                <Integration />
                {/* <Tabs className="ms-tabs" value={tab} onChange={handleChange}>
                    <Tab
                        disableRipple
                        title={getIntlText('common.label.integration')}
                        label={getIntlText('common.label.integration')}
                        value="1"
                    />
                </Tabs>
                <div className="ms-tab-content">
                    <TabPanel value={tab} index="1">
                        <Integration />
                    </TabPanel>
                </div> */}
                <div style={{ height: 300, width: 500 }}>
                    <Map />
                </div>
            </div>
        </div>
    );
}

export default IntegrationModule;
