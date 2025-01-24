import { useState, useLayoutEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { DevicesOtherIcon, EntityIcon } from '@milesight/shared/src/components';
import { thousandSeparate, objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { Breadcrumbs, Tooltip } from '@/components';
import {
    integrationAPI,
    IntegrationAPISchema,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import { usePermissionsError } from '@/hooks';
import { genInteIconUrl } from '../../helper';
import { GeneralContent, MscContent } from './components';

import './style.less';

const IntegrationDetail = () => {
    const { integrationId } = useParams();
    const { handlePermissionsError } = usePermissionsError();

    // ---------- Integrated Detail data logic ----------
    const { state } = useLocation();
    const [basicInfo, setBasicInfo] =
        useState<ObjectToCamelCase<IntegrationAPISchema['getList']['response'][0]>>();
    const [excludeServiceKeys, setExcludeServiceKeys] = useState<ApiKey[]>();
    const {
        loading,
        data: entityList,
        refresh: refreshInteDetail,
    } = useRequest(
        async () => {
            if (!integrationId) return;
            const [error, resp] = await awaitWrap(integrationAPI.getDetail({ id: integrationId }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) {
                handlePermissionsError(error);
                return;
            }
            const data = objectToCamelCase(respData);
            const excludeKeys = [data.addDeviceServiceKey, data.deleteDeviceServiceKey].filter(
                Boolean,
            );

            setBasicInfo(data);
            setExcludeServiceKeys(excludeKeys);
            return data.integrationEntities;
        },
        {
            debounceWait: 300,
            refreshDeps: [integrationId],
        },
    );
    const isMscIntegration = basicInfo?.id === 'msc-integration';

    useLayoutEffect(() => {
        if (!state?.id || state.id !== integrationId) return;
        setBasicInfo(state);
    }, [state, integrationId]);

    return (
        <div className="ms-main">
            <Breadcrumbs
                rewrite={navs => {
                    const newNavs = [...navs];
                    const lastNav = newNavs[newNavs.length - 1];

                    if (basicInfo?.name) {
                        lastNav.path = undefined;
                        lastNav.title = basicInfo.name;

                        // newNavs.push({
                        //     path: lastNav.path,
                        //     title: basicInfo.name,
                        // });
                    }

                    return newNavs;
                }}
            />
            <div className="ms-view ms-view-int-detail">
                <div className="ms-view-int-detail__header">
                    <div className="detail">
                        {basicInfo?.icon && (
                            <div className="logo">
                                <img src={genInteIconUrl(basicInfo.icon)} alt={basicInfo.name} />
                            </div>
                        )}
                        <Stack direction="column">
                            <div className="title">
                                <h2>{basicInfo?.name}</h2>
                                <div className="meta">
                                    <span className="meta-item">
                                        <DevicesOtherIcon />
                                        <span>
                                            {thousandSeparate(basicInfo?.deviceCount) || '-'}
                                        </span>
                                    </span>
                                    <span className="meta-item">
                                        <EntityIcon />
                                        <span>
                                            {thousandSeparate(basicInfo?.entityCount) || '-'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            {!!basicInfo?.description && (
                                <p className="desc">{basicInfo.description}</p>
                            )}
                        </Stack>
                    </div>
                </div>
                <div className="ms-view-int-detail__body">
                    {isMscIntegration ? (
                        <MscContent entities={entityList} onUpdateSuccess={refreshInteDetail} />
                    ) : (
                        <GeneralContent
                            loading={loading}
                            entities={entityList}
                            excludeServiceKeys={excludeServiceKeys}
                            onUpdateSuccess={refreshInteDetail}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntegrationDetail;
