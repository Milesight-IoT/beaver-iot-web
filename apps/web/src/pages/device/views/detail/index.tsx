import { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { useRouteTab, usePermissionsError } from '@/hooks';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceAPISchema,
} from '@/services/http';
import { Breadcrumbs, TabPanel } from '@/components';
import { BasicTable, EntityTable } from './components';
import './style.less';

type DeviceDetailType = ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

export default () => {
    const { state } = useLocation();
    const { deviceId } = useParams();
    const { getIntlText } = useI18n();
    const { handlePermissionsError } = usePermissionsError();

    // ---------- Device details related logic ----------
    const [deviceDetail, setDeviceDetail] = useState<DeviceDetailType>();
    const {
        loading,
        // data: deviceDetail,
        run: getDeviceDetail,
    } = useRequest(
        async () => {
            if (!deviceId) return;
            const [error, resp] = await awaitWrap(deviceAPI.getDetail({ id: deviceId }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) {
                handlePermissionsError(error);
                return;
            }

            const data = objectToCamelCase(respData);

            setDeviceDetail(data);
            return data;
        },
        {
            debounceWait: 300,
            refreshDeps: [deviceId],
        },
    );

    // Fill in default data
    useEffect(() => {
        if (!state?.id || state.id !== deviceId) return;

        setDeviceDetail(detail => {
            if (detail) return detail;
            return state;
        });
    }, [state, deviceId]);

    // ---------- Tab switches the related logic to ----------
    const tabs = useMemo(() => {
        return [
            {
                key: 'basic',
                label: getIntlText('device.detail.basic_info'),
                component: (
                    <BasicTable
                        data={deviceDetail}
                        loading={loading}
                        onEditSuccess={getDeviceDetail}
                    />
                ),
            },
            {
                key: 'entity',
                label: getIntlText('device.detail.entity_data'),
                component: <EntityTable data={deviceDetail} onRefresh={getDeviceDetail} />,
            },
        ];
    }, [deviceDetail, loading, getIntlText, getDeviceDetail]);
    const [tabKey, setTabKey] = useRouteTab(tabs[0].key);

    return (
        <div className="ms-main">
            <Breadcrumbs
                rewrite={navs => {
                    const newNavs = [...navs];
                    const lastNav = newNavs[newNavs.length - 1];

                    lastNav.title = deviceDetail?.name || lastNav.title;
                    return newNavs;
                }}
            />
            <div className="ms-view ms-view-device-detail">
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
