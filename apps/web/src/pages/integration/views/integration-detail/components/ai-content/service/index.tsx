import { useMemo, useState } from 'react';
import cls from 'classnames';
import { Grid2, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ChevronRightIcon, toast } from '@milesight/shared/src/components';
import { useConfirm, Tooltip } from '@/components';
import {
    camthinkApi,
    entityAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import { InteEntityType } from '../../../hooks';
import { entitiesCompose, getModelId, transModelInputs2Entities } from '../helper';
import { AI_SERVICE_KEYWORD, REFRESH_SERVICE_KEYWORD } from '../constants';
import TestModal from './test-modal';

type InteServiceType = InteEntityType & {
    children?: InteServiceType[];
};

interface Props {
    /** Loading or not */
    loading?: boolean;
    /** Service Entity Key that the page does not render */
    excludeKeys?: ApiKey[];
    /** Entity list */
    entities?: InteEntityType[];
    /** Service call successful callback */
    onUpdateSuccess?: (
        successCb?: (entityList?: InteEntityType[], excludeKeys?: ApiKey[]) => void,
    ) => void;
}

/**
 * Exclude service keys that should not be rendered in service list
 */
const excludeServices: ApiKey[] = ['camthink-ai-inference.integration.draw_result_image'];

/**
 * ai model services component
 */
const Service: React.FC<Props> = ({ loading, entities, excludeKeys, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Render service list ----------
    const serviceEntities = useMemo(() => {
        const result = entitiesCompose(entities, excludeKeys);
        return result.filter(item => !excludeServices.includes(item.key));
    }, [entities, excludeKeys]);
    const hasDescription = serviceEntities.some(item => item.description);

    // ---------- Handle service calls ----------
    const confirm = useConfirm();
    const [targetService, setTargetService] = useState<InteServiceType | null>();
    const handleClick = async (service: InteServiceType) => {
        // Refresh model list
        if (`${service.key}`.includes(REFRESH_SERVICE_KEYWORD)) {
            confirm({
                title: getIntlText('setting.integration.ai_update_model'),
                description: getIntlText('setting.integration.ai_update_model_tip'),
                type: 'info',
                async onConfirm() {
                    const [error, resp] = await awaitWrap(
                        entityAPI.callService({ exchange: { [service.key]: {} } }),
                    );

                    if (error || !isRequestSuccess(resp)) return;
                    onUpdateSuccess?.();
                    toast.success({ content: getIntlText('common.message.operation_success') });
                },
            });
            return;
        }

        // Get AI model config and open test modal
        if (`${service.key}`.includes(AI_SERVICE_KEYWORD)) {
            const modelId = getModelId(service.key);
            const [error, resp] = await awaitWrap(
                camthinkApi.syncModelDetail({
                    model_id: modelId || '',
                }),
            );
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            const formEntities = transModelInputs2Entities(data.input_entities);
            const record = {
                ...service,
                children: formEntities.length ? formEntities : service.children,
            };

            // onUpdateSuccess?.();
            setTargetService(record);
            return;
        }

        confirm({
            title: getIntlText('setting.integration.service_operation_confirm', {
                1: service.name,
            }),
            async onConfirm() {
                const [error, resp] = await awaitWrap(
                    entityAPI.callService({ exchange: { [service.key]: {} } }),
                );

                if (error || !isRequestSuccess(resp)) return;
                toast.success({ content: getIntlText('common.message.operation_success') });
            },
        });
    };

    return (
        <div className="ms-view-ai-service">
            <Grid2 container spacing={2}>
                {serviceEntities.map(service => (
                    <Grid2 key={service.key} size={{ sm: 6, md: 4, xl: 3 }}>
                        <div className="ms-int-feat-card" onClick={() => handleClick(service)}>
                            <div className="header">
                                <Tooltip autoEllipsis className="title" title={service.name} />
                                <IconButton sx={{ width: 24, height: 24 }}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </div>
                            <div className={cls('desc', { 'd-none': !hasDescription })}>
                                {!!service?.description && (
                                    <Tooltip
                                        autoEllipsis
                                        className="title"
                                        title={service.description}
                                    />
                                )}
                            </div>
                        </div>
                    </Grid2>
                ))}
            </Grid2>
            <TestModal
                visible={!!targetService}
                modelName={targetService?.name || ''}
                entities={targetService?.children || []}
                onCancel={() => setTargetService(null)}
            />
        </div>
    );
};

export default Service;
