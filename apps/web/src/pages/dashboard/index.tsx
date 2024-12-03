import { useState, useEffect } from 'react';
import { Tabs, Tab, Toolbar } from '@mui/material';
import { AddIcon, toast } from '@milesight/shared/src/components';
import { useI18n, usePreventLeave } from '@milesight/shared/src/hooks';
import { dashboardAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { DashboardDetail } from '@/services/http/dashboard';
import { TabPanel, useConfirm } from '@/components';
import DashboardContent from './components/dashboard-content';
import AddDashboard from './components/add-dashboard';
import './style.less';

export default () => {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const [tabs, setTabs] = useState<DashboardDetail[]>([]);
    const [tabKey, setTabKey] = useState<ApiKey>();
    const [showAdd, setShowAdd] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const { showPrevent } = usePreventLeave({
        confirm,
        isPreventLeave: isEdit,
    });

    const getDashboards = async () => {
        const [_, res] = await awaitWrap(dashboardAPI.getDashboards());
        if (isRequestSuccess(res)) {
            const data = getResponseData(res);
            setTabs(data || []);
            // 没有选择则默认选中第一个
            if (!tabKey) {
                setTabKey(data?.[0]?.dashboard_id || '');
            } else {
                // 已选中判断当前选中是否还存在不存在默认选中第一个
                const isExist = data?.some((item: DashboardDetail) => item.dashboard_id === tabKey);
                if (!isExist) {
                    setTabKey(data?.[0]?.dashboard_id || '');
                }
            }
        }
    };

    useEffect(() => {
        getDashboards();
    }, []);

    // 切换dashboard页签
    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        // 判断是否编辑状态并阻止跳转
        if (isEdit) {
            showPrevent({
                onOk: () => {
                    setTabKey(newValue);
                    setIsEdit(false);
                },
            });
        } else {
            setTabKey(newValue);
        }
    };

    // 显示新增dashboard弹框
    const showAddDashboard = () => {
        setShowAdd(true);
    };

    const handleCloseAdd = () => {
        setShowAdd(false);
    };

    // 添加dashboard
    const handleAdd = async (data: DashboardDetail) => {
        const [_, res] = await awaitWrap(dashboardAPI.addDashboard(data));
        if (isRequestSuccess(res)) {
            const resData: any = getResponseData(res);
            setTabs([...tabs, { ...data, dashboard_id: resData.dashboard_id, widgets: [] }]);
            setShowAdd(false);
            toast.success(getIntlText('common.message.operation_success'));
        }
    };

    return (
        <div className="ms-main dashboard">
            <div className="ms-view ms-view-dashboard">
                <Toolbar className="dashboard-toolbar">
                    <Tabs
                        variant="scrollable"
                        scrollButtons="auto"
                        className="ms-tabs"
                        value={tabKey}
                        onChange={handleChange}
                        sx={{
                            '& .MuiTabs-scrollButtons': {
                                '&.Mui-disabled': {
                                    width: 0, // 隐藏禁用的滚动按钮
                                },
                            },
                            '& .MuiTabs-scrollButtons.Mui-disabled': {
                                display: 'none', // 完全隐藏禁用的滚动按钮
                            },
                        }}
                    >
                        {tabs?.map(tabItem => {
                            return (
                                <Tab
                                    key={tabItem.dashboard_id}
                                    disableRipple
                                    title={tabItem.name}
                                    label={tabItem.name}
                                    value={tabItem.dashboard_id}
                                />
                            );
                        })}
                    </Tabs>
                    <div className="dashboard-add" onClick={showAddDashboard}>
                        <AddIcon className="dashboard-add-icon" />
                    </div>
                </Toolbar>
                <div className="ms-tab-content">
                    {tabs?.map(tabItem => {
                        return (
                            <TabPanel
                                key={tabItem.dashboard_id}
                                value={tabKey || ''}
                                index={tabItem.dashboard_id}
                            >
                                <DashboardContent
                                    dashboardDetail={tabItem}
                                    getDashboards={getDashboards}
                                    isEdit={isEdit}
                                    onChangeIsEdit={setIsEdit}
                                />
                            </TabPanel>
                        );
                    })}
                </div>
            </div>
            {showAdd && <AddDashboard onCancel={handleCloseAdd} onOk={handleAdd} />}
        </div>
    );
};
