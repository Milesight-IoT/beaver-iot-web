import { useState, useEffect } from 'react';
import cls from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { Tabs, Tab, Toolbar, CircularProgress } from '@mui/material';
import { AddIcon, toast } from '@milesight/shared/src/components';
import { useI18n, usePreventLeave } from '@milesight/shared/src/hooks';
import { dashboardAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { DashboardDetail } from '@/services/http/dashboard';
import { TabPanel, useConfirm, PermissionControlHidden, Empty } from '@/components';
import { PERMISSIONS } from '@/constants';
import { useDashboardStore } from '@/stores';
import DashboardContent from './components/dashboard-content';
import AddDashboard from './components/add-dashboard';
import './style.less';

export default () => {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const { updateIsEditing } = useDashboardStore();

    const [tabs, setTabs] = useState<DashboardDetail[]>([]);
    const [tabKey, setTabKey] = useState<ApiKey>();
    const [showAdd, setShowAdd] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState<boolean>();
    const [isTooSmallScreen, setIsTooSmallScreen] = useState(false);

    const { showPrevent } = usePreventLeave({
        confirm,
        isPreventLeave: isEdit,
    });

    const getDashboards = async () => {
        try {
            setLoading(true);

            const [_, res] = await awaitWrap(dashboardAPI.getDashboards());
            if (isRequestSuccess(res)) {
                const data = getResponseData(res);
                setTabs(data || []);
                // If no option is selected, the first option is selected by default
                if (!tabKey) {
                    setTabKey(data?.[0]?.dashboard_id || '');
                } else {
                    // Yes Check whether the current selection still exists. If no, the first one is selected by default
                    const isExist = data?.some(
                        (item: DashboardDetail) => item.dashboard_id === tabKey,
                    );
                    if (!isExist) {
                        setTabKey(data?.[0]?.dashboard_id || '');
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    /** To storage the dashboard isEditing status */
    useEffect(() => {
        updateIsEditing(isEdit);
    }, [isEdit]);

    useEffect(() => {
        getDashboards();
    }, []);

    /** To judge current screen whether too small */
    useEffect(() => {
        const getWindowWidth = () => {
            const windowWidth =
                document.body.clientWidth ||
                document.documentElement.clientWidth ||
                window.innerWidth;

            const isTooSmall = windowWidth <= 720;
            setIsTooSmallScreen(isTooSmall);

            if (isTooSmall) {
                setIsEdit(false);
            }
        };
        getWindowWidth();

        window.addEventListener('resize', getWindowWidth);

        return () => {
            window.removeEventListener('resize', getWindowWidth);
        };
    }, []);

    // Switch dashboard tabs
    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        // Determine whether to edit the state and block the jump
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

    // The new dashboard pop-up is displayed
    const showAddDashboard = () => {
        setShowAdd(true);
    };

    const handleCloseAdd = () => {
        setShowAdd(false);
    };

    // Add dashboard
    const handleAdd = async (data: DashboardDetail) => {
        const [_, res] = await awaitWrap(dashboardAPI.addDashboard(data));
        if (isRequestSuccess(res)) {
            const resData: any = getResponseData(res);
            setTabs([...tabs, { ...data, dashboard_id: resData.dashboard_id, widgets: [] }]);
            setShowAdd(false);
            toast.success(getIntlText('common.message.operation_success'));
            // If the dashboard is newly added, a prompt is displayed indicating whether to switch to a new tab page
            if (!data.dashboard_id) {
                if (isEdit) {
                    confirm({
                        title: getIntlText('common.modal.title_leave_current_page'),
                        description: getIntlText('dashboard.leave_to_new_dashboard_description'),
                        confirmButtonText: getIntlText('common.button.confirm'),
                        onConfirm: () => {
                            setTabKey(resData.dashboard_id);
                            setIsEdit(false);
                        },
                    });
                } else {
                    setTabKey(resData.dashboard_id);
                }
            }
        }
    };

    const renderTabContent = () => {
        if (loading || isNil(loading)) {
            return (
                <div className="ms-tab-content__empty">
                    <CircularProgress />
                </div>
            );
        }

        if (!Array.isArray(tabs) || isEmpty(tabs)) {
            return (
                <div className="ms-tab-content__empty">
                    <Empty text={getIntlText('common.label.empty')} />
                </div>
            );
        }

        return tabs?.map(tabItem => {
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
                        isTooSmallScreen={isTooSmallScreen}
                    />
                </TabPanel>
            );
        });
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
                                    width: 0, // Hide disabled scroll buttons
                                },
                            },
                            '& .MuiTabs-scrollButtons.Mui-disabled': {
                                display: 'none', // Completely hides disabled scroll buttons
                            },
                            '.MuiTabs-flexContainer': {
                                borderBottom: 'none',
                                padding: '0 16px',
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
                    <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_ADD}>
                        <div
                            className={cls('dashboard-add-contain', {
                                'dashboard-add-contain-list': !!tabs?.length,
                            })}
                        >
                            <div className="dashboard-add" onClick={showAddDashboard}>
                                <AddIcon className="dashboard-add-icon" />
                            </div>
                        </div>
                    </PermissionControlHidden>
                </Toolbar>
                <div className="ms-tab-content">{renderTabContent()}</div>
            </div>
            {showAdd && <AddDashboard onCancel={handleCloseAdd} onOk={handleAdd} />}
        </div>
    );
};
