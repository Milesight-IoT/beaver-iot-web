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
    /** 是否加载中 */
    loading?: boolean;

    /** 实体列表 */
    entities?: InteEntityType[];

    /** 页面不做渲染的实体 Key */
    excludeKeys?: ApiKey[];

    /** 编辑成功回调 */
    onUpdateSuccess?: () => void;
}

type InteServiceType = InteEntityType & {
    children?: InteServiceType[];
};

/**
 * 属性实体渲染及操作组件
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

        // TODO: 多层级(>2)服务参数处理
        result?.forEach(item => {
            if (!item.parent) return;

            const service = result.find(it => it.key === item.parent);

            if (!service) return;
            service.children = service.children || [];
            service.children.push(item);
        });

        return result.filter(item => !item.parent);
    }, [entities, excludeKeys]);

    // ---------- 卡片点击相关处理逻辑 ----------
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
                    entityAPI.callService({ exchange: { [service.key]: null } }),
                );
                if (error || !isRequestSuccess(resp)) return;
                onUpdateSuccess?.();
                toast.success({ content: getIntlText('common.message.operation_success') });
            },
        });
    };

    // ---------- 弹窗表单相关处理逻辑 ----------
    const [targetService, setTargetService] = useState<InteServiceType>();
    const { control, handleSubmit, setValue } = useForm<EntityFormDataProps>();
    const { formItems, decodeFormParams, encodeFormData } = useEntityFormItems({
        entities: targetService?.children,
        isAllRequired: true,
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
                exchange: {
                    [targetService.key]:
                        isEmpty(finalParams) ||
                        Object.values(finalParams).every(val => isUndefined(val))
                            ? null
                            : finalParams,
                },
            }),
        );
        if (error || !isRequestSuccess(resp)) return;

        onUpdateSuccess?.();
        setTargetService(undefined);
        toast.success({ content: getIntlText('common.message.operation_success') });
    };

    // 表单数据回填
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
