import { useNavigate } from 'react-router-dom';
import { Grid2, CircularProgress } from '@mui/material';
import { useRequest } from 'ahooks';
import { DevicesOtherIcon, EntityIcon } from '@milesight/shared/src/components';
import { thousandSeparate, objectToCamelCase } from '@milesight/shared/src/utils/tools';
import {
    integrationAPI,
    IntegrationAPISchema,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import { Tooltip } from '@/components';
import { genInteIconUrl } from '../../helper';
import './style.less';

const Integration = () => {
    const navigate = useNavigate();
    const handleCardClick = (
        id: ApiKey,
        record: ObjectToCamelCase<IntegrationAPISchema['getList']['response'][number]>,
    ) => {
        navigate(`/setting/integration/${id}`, { state: record });
    };

    const { data: intList, loading } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(integrationAPI.getList());
            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp) || [];

            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
        },
    );

    return (
        <>
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
            {loading && <CircularProgress />}
        </>
    );
};

export default Integration;
