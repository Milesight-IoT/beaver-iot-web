import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid2, CircularProgress } from '@mui/material';
import { useRequest } from 'ahooks';
import { isEmpty, isNil } from 'lodash-es';
import { DevicesOtherIcon, EntityIcon } from '@milesight/shared/src/components';
import { thousandSeparate, objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    integrationAPI,
    IntegrationAPISchema,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import { Tooltip, Empty } from '@/components';
import { genInteIconUrl } from '../../helper';
import './style.less';

const Integration = () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();
    const [loading, setLoading] = useState<boolean>();

    const handleCardClick = (
        id: ApiKey,
        record: ObjectToCamelCase<IntegrationAPISchema['getList']['response'][number]>,
    ) => {
        navigate(`/integration/detail/${id}`, { state: record });
    };

    const { data: intList } = useRequest(
        async () => {
            try {
                setLoading(true);

                const [error, resp] = await awaitWrap(integrationAPI.getList());
                if (error || !isRequestSuccess(resp)) return;
                const data = getResponseData(resp) || [];

                return objectToCamelCase(data);
            } finally {
                setLoading(false);
            }
        },
        {
            debounceWait: 300,
        },
    );

    const renderList = () => {
        if (loading || isNil(loading)) {
            return (
                <div className="ms-int-card__loading">
                    <CircularProgress />
                </div>
            );
        }

        if (!Array.isArray(intList) || isEmpty(intList)) {
            return (
                <div className="ms-int-card__empty">
                    <Empty text={getIntlText('common.label.empty')} />
                </div>
            );
        }

        return (
            <Grid2 container spacing={2}>
                {intList?.map(item => (
                    <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                        <div className="ms-int-card" onClick={() => handleCardClick(item.id, item)}>
                            <div className="icon">
                                {!!item.icon && (
                                    <img src={genInteIconUrl(item.icon)} alt={item.name} />
                                )}
                            </div>
                            <Tooltip autoEllipsis className="title" title={item.name} />
                            <Tooltip autoEllipsis className="desc" title={item.description} />
                            <div className="meta">
                                <span className="meta-item">
                                    <DevicesOtherIcon />
                                    <span>{thousandSeparate(item.deviceCount) || '-'}</span>
                                </span>
                                <span className="meta-item">
                                    <EntityIcon />
                                    <span>{thousandSeparate(item.entityCount) || '-'}</span>
                                </span>
                            </div>
                        </div>
                    </Grid2>
                ))}
            </Grid2>
        );
    };

    return renderList();
};

export default Integration;
