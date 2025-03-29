import { useState, useRef, useEffect } from 'react';
import { Button, Popover } from '@mui/material';
import {
    AddIcon as Add,
    DeleteOutlineIcon as DeleteOutline,
    CloseIcon as Close,
    CheckIcon as Check,
    EditIcon as Edit,
    FullscreenIcon,
    InfoIcon,
    toast,
} from '@milesight/shared/src/components';
import { cloneDeep } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { dashboardAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { DashboardDetail, WidgetDetail } from '@/services/http/dashboard';
import { useConfirm, PermissionControlHidden, PermissionControlDisabled } from '@/components';
import { PERMISSIONS } from '@/constants';
import { useGetPluginConfigs } from '../../hooks';
import AddWidget from '../add-widget';
import PluginList from '../plugin-list';
import PluginListClass from '../plugin-list-class';
import AddCustomerWidget from '../custom-widget';
import AddDashboard from '../add-dashboard';
import Widgets from '../widgets';

interface DashboardContentProps {
    dashboardDetail: DashboardDetail;
    getDashboards: () => void;
    onChangeIsEdit: (isEdit: boolean) => void;
    isEdit: boolean;
    isTooSmallScreen: boolean;
}

export default (props: DashboardContentProps) => {
    const { getIntlText } = useI18n();
    const { pluginsConfigs } = useGetPluginConfigs();
    const confirm = useConfirm();
    const { dashboardDetail, getDashboards, onChangeIsEdit, isEdit, isTooSmallScreen } = props;
    const [isShowAddWidget, setIsShowAddWidget] = useState(false);
    const [isShowEditDashboard, setIsShowEditDashboard] = useState(false);
    const [widgets, setWidgets] = useState<WidgetDetail[]>([]);
    const [plugin, setPlugin] = useState<WidgetDetail>();
    const [showCustom, setShowCustom] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [loading, setLoading] = useState(true);
    // const [isEdit, setIsEdit] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const widgetsRef = useRef<any[]>([]);
    /** normal screen widget position info storage */
    const normalWidgetRef = useRef<any[]>([]);

    useEffect(() => {
        // Merge the data in the database with the local one to ensure that the component configuration is locally up to date
        const newWidgets = dashboardDetail.widgets?.map((item: WidgetDetail) => {
            const sourceJson = pluginsConfigs.find(plugin => item.data.type === plugin.type);
            if (sourceJson) {
                return {
                    ...item,
                    data: {
                        ...item.data,
                        ...sourceJson,
                    },
                };
            }
            return item;
        });
        setWidgets([...(newWidgets || [])]);
        setLoading(false);
        widgetsRef.current = cloneDeep(newWidgets || []);

        if (!isTooSmallScreen) {
            normalWidgetRef.current = cloneDeep(newWidgets || []);
        }
    }, [dashboardDetail.widgets, pluginsConfigs, isTooSmallScreen]);

    useEffect(() => {
        if (!isTooSmallScreen) {
            setWidgets(cloneDeep(normalWidgetRef.current));
        }
    }, [isTooSmallScreen]);

    const dashboardId = dashboardDetail.dashboard_id;

    // Change edit status
    const setIsEdit = (edit: boolean) => {
        onChangeIsEdit(edit);
    };

    const handleShowAddWidget = (event: React.MouseEvent<HTMLButtonElement>) => {
        setIsShowAddWidget(true);
        setAnchorEl(event.currentTarget);
    };

    const handleCloseAddWidgetPopover = () => {
        setIsShowAddWidget(false);
        setAnchorEl(null);
    };

    const handleSelectPlugin = (plugin: WidgetDetail) => {
        handleCloseAddWidgetPopover();
        changeEditStatus();
        setPlugin(plugin);
    };

    const closeAddWidget = () => {
        setPlugin(undefined);
    };

    const handleChangeWidgets = (data: any) => {
        setWidgets(data);
    };

    const handleOk = (data: WidgetDetail) => {
        const newWidgets = [...(widgets || [])];
        const index = newWidgets.findIndex(
            (item: WidgetDetail) =>
                (item.widget_id && item.widget_id === data.widget_id) ||
                (item.tempId && item.tempId === data.tempId),
        );
        if (index > -1) {
            newWidgets[index] = data;
        } else {
            newWidgets.push(data);
        }
        // widgetsRef.current = cloneDeep(newWidgets);
        handleChangeWidgets(newWidgets);
    };

    const handleShowAddCustomWidget = () => {
        setShowCustom(true);
    };

    const closeAddCustomWidget = () => {
        setShowCustom(false);
    };

    // The dashboard editing mode is displayed
    const changeEditStatus = () => {
        setIsEdit(true);
    };

    // Exit dashboard editing status
    const cancelEditStatus = () => {
        setIsEdit(false);
        const newWidgets = cloneDeep(widgetsRef.current);
        setWidgets(newWidgets);
    };

    // Edit dashboard Save
    const saveEditDashboard = async () => {
        const [_, res] = await awaitWrap(
            dashboardAPI.updateDashboard({
                widgets,
                dashboard_id: dashboardId,
                name: dashboardDetail.name,
            }),
        );
        if (isRequestSuccess(res)) {
            getDashboards();
            setIsEdit(false);
            toast.success(getIntlText('common.message.operation_success'));
        }
    };

    // Deleting a dashboard
    const handleDelete = async () => {
        confirm({
            title: getIntlText('common.label.delete'),
            icon: <InfoIcon className="dashboard-confirm-delete-icon" />,
            description: getIntlText('dashboard.plugin.trigger_confirm_text'),
            confirmButtonText: getIntlText('common.button.confirm'),
            onConfirm: async () => {
                const [_, res] = await awaitWrap(
                    dashboardAPI.deleteDashboard({
                        id: dashboardId,
                    }),
                );
                if (isRequestSuccess(res)) {
                    getDashboards();
                    setIsEdit(false);
                    toast.success(getIntlText('common.message.delete_success'));
                }
            },
        });
    };

    // The Edit dashboard pop-up is displayed
    const showEditDashboard = () => {
        setIsShowEditDashboard(true);
    };

    const handleCloseEditDashboard = () => {
        setIsShowEditDashboard(false);
    };

    // Add dashboard
    const handleEditDashboard = async (data: AddDashboardType) => {
        const [_, res] = await awaitWrap(
            dashboardAPI.updateDashboard({
                dashboard_id: dashboardId,
                name: data.name,
                widgets: dashboardDetail.widgets,
            }),
        );
        if (isRequestSuccess(res)) {
            getDashboards();
            setIsShowEditDashboard(false);
            toast.success(getIntlText('common.message.operation_success'));
        }
    };

    // Go to full screen
    const enterFullscreen = () => {
        if (mainRef.current?.requestFullscreen) {
            mainRef.current.requestFullscreen();
        }
    };

    return (
        <div className="dashboard-content">
            <div className="dashboard-content-operate">
                <div className="dashboard-content-operate-left">
                    {isEdit ? (
                        <>
                            <Button
                                variant="contained"
                                onClick={handleShowAddWidget}
                                startIcon={<Add />}
                            >
                                {getIntlText('dashboard.add_widget')}
                            </Button>
                            {/* <Button
                                variant="contained"
                                onClick={handleShowAddCustomWidget}
                                sx={{ marginLeft: '20px' }}
                                startIcon={<Add />}
                            >
                                {getIntlText('dashboard.add_custom_components')}
                            </Button> */}
                        </>
                    ) : (
                        <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_EDIT}>
                            <Button
                                disabled={isTooSmallScreen}
                                startIcon={<Edit />}
                                variant="contained"
                                onClick={changeEditStatus}
                            >
                                {getIntlText('common.button.edit')}
                            </Button>
                        </PermissionControlHidden>
                    )}
                </div>
                {isEdit ? (
                    <div className="dashboard-content-operate-right">
                        <Button
                            variant="outlined"
                            onClick={handleDelete}
                            startIcon={<DeleteOutline />}
                        >
                            {getIntlText('common.label.delete')}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={showEditDashboard}
                            sx={{ marginLeft: '12px' }}
                            startIcon={<Edit />}
                        >
                            {getIntlText('common.label.rename')}
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{ marginLeft: '12px' }}
                            onClick={cancelEditStatus}
                            startIcon={<Close />}
                        >
                            {getIntlText('common.button.cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={saveEditDashboard}
                            sx={{ marginLeft: '12px' }}
                            startIcon={<Check />}
                        >
                            {getIntlText('common.button.save')}
                        </Button>
                    </div>
                ) : !widgets?.length && !loading ? null : (
                    <div className="dashboard-content-operate-right">
                        <div onClick={enterFullscreen} className="dashboard-fullscreen">
                            <FullscreenIcon className="dashboard-fullscreen-icon" />
                        </div>
                    </div>
                )}
            </div>
            {isShowEditDashboard && (
                <AddDashboard
                    onCancel={handleCloseEditDashboard}
                    onOk={handleEditDashboard}
                    data={dashboardDetail}
                />
            )}
            {!!plugin && (
                <AddWidget
                    parentRef={mainRef}
                    widgets={widgets}
                    plugin={plugin}
                    onCancel={closeAddWidget}
                    onOk={handleOk}
                />
            )}
            {!widgets?.length && !loading ? (
                <PermissionControlDisabled permissions={PERMISSIONS.DASHBOARD_EDIT}>
                    <div className="dashboard-content-empty">
                        <div className="dashboard-content-empty-title">
                            {getIntlText('dashboard.empty_text')}
                        </div>
                        <div className="dashboard-content-empty-description">
                            {getIntlText('dashboard.empty_description')}
                        </div>
                        <PluginList onSelect={handleSelectPlugin} />
                    </div>
                </PermissionControlDisabled>
            ) : (
                <div
                    className="dashboard-content-main bg-custom-scrollbar ms-perfect-scrollbar"
                    ref={mainRef}
                >
                    <Widgets
                        widgets={widgets}
                        onChangeWidgets={handleChangeWidgets}
                        isEdit={isEdit}
                        onEdit={handleSelectPlugin}
                        mainRef={mainRef}
                        isTooSmallScreen={isTooSmallScreen}
                    />
                </div>
            )}
            {!!showCustom && <AddCustomerWidget onCancel={closeAddCustomWidget} />}
            <Popover
                open={isShowAddWidget}
                anchorEl={anchorEl}
                onClose={handleCloseAddWidgetPopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <PluginListClass onSelect={handleSelectPlugin} />
            </Popover>
        </div>
    );
};
