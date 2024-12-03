import { memo } from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: ApiKey;
    value: ApiKey;
}

/**
 * MUI Tab 选项卡面板组件
 */
const TabPanel = memo((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`ms-tabpanel-${index}`}
            className={`ms-tabpanel ms-tabpanel-${index}`}
            aria-labelledby={`ms-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </div>
    );
});

export default TabPanel;
