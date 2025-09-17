import { useMemo, useEffect, useState } from 'react';
import { Grid2, IconButton } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { cloneDeep, isEmpty, isUndefined } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, ChevronRightIcon, toast } from '@milesight/shared/src/components';
import { useEntityFormItems, type EntityFormDataProps } from '@/hooks';
import { useConfirm, Tooltip, Empty } from '@/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { type InteEntityType } from '../../../hooks';

interface Props {
    /** Loading or not */
    loading?: boolean;

    /** Entity list */
    entities?: InteEntityType[];

    /** The page does not render the entity Key */
    excludeKeys?: ApiKey[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

type InteServiceType = InteEntityType & {
    children?: InteServiceType[];
};

/**
 * Attribute entity rendering and manipulation components
 */
const Service: React.FC<Props> = ({ loading, entities, excludeKeys, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const serviceEntities = useMemo(() => {
        const services = entities?.filter(item => {
            return (
                item.type === 'SERVICE' &&
                !excludeKeys?.some(key => `${item.key}`.includes(`${key}`))
            );
        });
        const result: InteServiceType[] = cloneDeep(services || []);

        // TODO: Multi-level (>2) service parameter processing
        result?.forEach(item => {
            if (!item.parent) return;

            const service = result.find(it => it.key === item.parent);

            if (!service) return;
            service.children = service.children || [];
            service.children.push(item);
        });

        /**
         * If the sub entity is empty, and the entity value type is not BINARY, ENUM, or OBJECT,
         * use the entity itself as the sub entity.
         */
        result.forEach(item => {
            if (
                item.children?.length ||
                (['BINARY', 'ENUM', 'OBJECT'] as EntityValueDataType[]).includes(item.valueType)
            ) {
                return;
            }
            item.children = item.children || [];
            item.children.push(item);
        });

        return result.filter(item => !item.parent);
    }, [entities, excludeKeys]);

    // ---------- card Click on Related Processing logic ----------
    const confirm = useConfirm();
    const handleClick = (service: InteServiceType) => {
        if (service.children) {
            setTargetService(service);
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
                onUpdateSuccess?.();
                toast.success({ content: getIntlText('common.message.operation_success') });
            },
        });
    };

    // ---------- pop-up form related processing logic ----------
    const [targetService, setTargetService] = useState<InteServiceType>();
    const { control, handleSubmit, setValue, getValues } = useForm<EntityFormDataProps>({
        shouldUnregister: true,
    });
    const { formItems, decodeFormParams, encodeFormData } = useEntityFormItems({
        entities: targetService?.children,
        // isAllRequired: true,
    });
    const onSubmit: SubmitHandler<EntityFormDataProps> = async params => {
        if (!targetService) return;
        const finalParams = decodeFormParams(params);

        if (!finalParams) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        const [error, resp] = await awaitWrap(
            entityAPI.callService({
                exchange: Object.values(finalParams).every(val => isUndefined(val))
                    ? {}
                    : finalParams,
            }),
        );
        if (error || !isRequestSuccess(resp)) return;

        onUpdateSuccess?.();
        setTargetService(undefined);
        toast.success({ content: getIntlText('common.message.operation_success') });
    };

    // Form data backfill
    useEffect(() => {
        if (!targetService?.children?.length) return;

        const formData = encodeFormData(targetService.children);

        Object.entries(formData || {}).forEach(([key, value]) => {
            setValue(key, value);
        });
    }, [targetService, setValue, encodeFormData]);

    return !serviceEntities?.length ? (
        <Empty
            loading={loading}
            type="nodata"
            text={getIntlText('common.label.empty')}
            className="ms-empty"
        />
    ) : (
        <div className="ms-tab-panel-service">
            <Grid2 container spacing={2}>
                {serviceEntities.map(service => (
                    <Grid2 key={service.key} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                        <div className="ms-int-feat-card" onClick={() => handleClick(service)}>
                            <div className="header">
                                <Tooltip autoEllipsis className="title" title={service.name} />
                                <IconButton sx={{ width: 24, height: 24 }}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </div>
                        </div>
                    </Grid2>
                ))}
            </Grid2>
            <Modal
                size="lg"
                visible={!!targetService}
                title={targetService?.name}
                onCancel={() => setTargetService(undefined)}
                onOk={handleSubmit(onSubmit)}
            >
                {formItems.map(props => (
                    <Controller<EntityFormDataProps>
                        {...props}
                        key={props.name}
                        control={control}
                    />
                ))}
            </Modal>
        </div>
    );
};

export default Service;
