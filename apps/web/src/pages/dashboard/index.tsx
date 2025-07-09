import { useState, useEffect } from 'react';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { Tabs, Tab, Toolbar, CircularProgress } from '@mui/material';
import { AddIcon, toast } from '@milesight/shared/src/components';
import { useI18n, usePreventLeave } from '@milesight/shared/src/hooks';
import { dashboardAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { DashboardDetail } from '@/services/http/dashboard';
import { useMqtt, MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME } from '@/hooks';
import { useConfirm, PermissionControlHidden, Empty, SidebarController } from '@/components';
import { useActivityEntity } from '@/plugin/hooks';
import { PERMISSIONS } from '@/constants';
import { useDashboardStore } from '@/stores';
import DashboardContent, { type DashboardContentProps } from './components/dashboard-content';
import AddDashboard from './components/add-dashboard';
import './style.less';

export default () => {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const updateIsEditing = useDashboardStore(state => state.updateIsEditing);
    const { setLatestEntities, triggerEntityListener } = useActivityEntity();

    // ---------- Prevent leave page ----------
    const [isEdit, setIsEdit] = useState(false);
    const { showPrevent } = usePreventLeave({
        confirm,
        isPreventLeave: isEdit,
    });

    /** Cache the dashboard isEditing status */
    useEffect(() => {
        updateIsEditing(isEdit);
    }, [isEdit, updateIsEditing]);

    // ---------- Check if the screen is too small  ----------
    const [isTooSmallScreen, setIsTooSmallScreen] = useState(false);

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

    // ---------- Render dashboard list & content ----------
    const [loading, setLoading] = useState<boolean>();
    const [currentDashboardId, setCurrentDashboardId] = useState<ApiKey>();
    const {
        data: dashboardList,
        run: getDashboardList,
        mutate: setDashboardList,
    } = useRequest(
        async () => {
            setLoading(true);
            const [error, resp] = await awaitWrap(dashboardAPI.getDashboards());
            setLoading(false);

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);
            setCurrentDashboardId(key => {
                const isExist = data?.some(item => item.dashboard_id === key);

                if (!key || !isExist) return data?.[0]?.dashboard_id || '';
                return key;
            });

            return data;
        },
        {
            debounceWait: 300,
        },
    );
    const { data: dashboardDetail, run: getDashboardDetail } = useRequest(
        async () => {
            if (!currentDashboardId) return;
            setLoading(true);
            const [error, resp] = await awaitWrap(
                dashboardAPI.getDashboardDetail({ id: currentDashboardId }),
            );
            setLoading(false);

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);

            setLatestEntities(data?.entities || []);
            return data;
        },
        {
            debounceWait: 300,
            refreshDeps: [currentDashboardId],
        },
    );

    // Switch dashboard tabs
    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        // Determine whether to edit the state and block the jump
        if (!isEdit) {
            setLoading(true);
            setCurrentDashboardId(newValue);
            return;
        }

        showPrevent({
            onOk: () => {
                setLoading(true);
                setCurrentDashboardId(newValue);
                setIsEdit(false);
            },
        });
    };

    const handleEditSuccess: DashboardContentProps['onEditSuccess'] = async type => {
        switch (type) {
            case 'rename': {
                getDashboardList();
                getDashboardDetail();
                break;
            }
            case 'delete': {
                setLoading(true);
                setCurrentDashboardId(dashboardList?.[0]?.dashboard_id);
                getDashboardList();
                break;
            }
            case 'save': {
                setLoading(true);
                getDashboardDetail();
                break;
            }
            case 'home': {
                setLoading(true);
                await getDashboardList();
                await getDashboardDetail();
                break;
            }
            default: {
                break;
            }
        }
    };

    // ---------- Add dashboard Modal ---------
    const [addModalVisible, setAddModalVisible] = useState(false);
    const handleAddDashboard = async (data: DashboardDetail) => {
        const [error, resp] = await awaitWrap(dashboardAPI.addDashboard(data));

        if (error || !isRequestSuccess(resp)) return;
        const respData: any = getResponseData(resp);
        setDashboardList([
            ...(dashboardList || []),
            { ...data, dashboard_id: respData.dashboard_id, widgets: [] },
        ]);
        setAddModalVisible(false);
        toast.success(getIntlText('common.message.operation_success'));

        // If the dashboard is newly added, a prompt is displayed indicating whether to switch to a new tab page
        if (data.dashboard_id) return;
        if (isEdit) {
            confirm({
                title: getIntlText('common.modal.title_leave_current_page'),
                description: getIntlText('dashboard.leave_to_new_dashboard_description'),
                confirmButtonText: getIntlText('common.button.confirm'),
                onConfirm: () => {
                    setLoading(true);
                    setCurrentDashboardId(respData.dashboard_id);
                    setIsEdit(false);
                },
            });
        } else {
            setLoading(true);
            setCurrentDashboardId(respData.dashboard_id);
        }
    };

    // ---------- Listen the entities change by Mqtt ----------
    const { status: mqttStatus, client: mqttClient } = useMqtt();

    // Subscribe the entity exchange topic
    useEffect(() => {
        if (!currentDashboardId || !mqttClient || mqttStatus !== MQTT_STATUS.CONNECTED) return;

        const removeTriggerListener = mqttClient.subscribe(MQTT_EVENT_TYPE.EXCHANGE, payload => {
            triggerEntityListener(payload.payload?.entity_ids || [], {
                dashboardId: currentDashboardId,
                payload,
                periodTime: BATCH_PUSH_TIME,
            });
        });

        return removeTriggerListener;
    }, [mqttStatus, mqttClient, currentDashboardId, triggerEntityListener]);

    // Unsubscribe the topic when the dashboard page is unmounted
    useEffect(() => {
        return () => {
            mqttClient?.unsubscribe(MQTT_EVENT_TYPE.EXCHANGE);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ms-main dashboard">
            <div className="ms-view ms-view-dashboard">
                <Toolbar className="dashboard-toolbar">
                    <SidebarController />
                    <Tabs
                        variant="scrollable"
                        scrollButtons="auto"
                        className="ms-tabs"
                        value={currentDashboardId}
                        onChange={handleTabChange}
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
                        {dashboardList?.map(item => {
                            return (
                                <Tab
                                    key={item.dashboard_id}
                                    disableRipple
                                    title={item.name}
                                    label={item.name}
                                    value={item.dashboard_id}
                                />
                            );
                        })}
                    </Tabs>
                    <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_ADD}>
                        <div
                            className={cls('dashboard-add-contain md:d-none', {
                                'dashboard-add-contain-list': !!dashboardList?.length,
                            })}
                        >
                            <div className="dashboard-add" onClick={() => setAddModalVisible(true)}>
                                <AddIcon className="dashboard-add-icon" />
                            </div>
                        </div>
                    </PermissionControlHidden>
                </Toolbar>
                <div className={cls('ms-tab-content', { loading: loading !== false })}>
                    {loading !== false ? (
                        <div className="ms-tab-content__empty">
                            <CircularProgress />
                        </div>
                    ) : !dashboardDetail ? (
                        <div className="ms-tab-content__empty">
                            <Empty text={getIntlText('common.label.empty')} />
                        </div>
                    ) : (
                        <DashboardContent
                            key={currentDashboardId}
                            dashboardDetail={dashboardDetail}
                            // getDashboards={getDashboardList}
                            onEditSuccess={handleEditSuccess}
                            isEdit={isEdit}
                            onChangeIsEdit={setIsEdit}
                            isTooSmallScreen={isTooSmallScreen}
                            existedHomeDashboard={(dashboardList || [])?.some(t => Boolean(t.home))}
                        />
                    )}
                </div>
            </div>
            {addModalVisible && (
                <AddDashboard
                    onCancel={() => setAddModalVisible(false)}
                    onOk={handleAddDashboard}
                />
            )}
        </div>
    );
};
