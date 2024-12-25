import { useEffect, useMemo, useState } from 'react';
import { Tooltip, Chip, type SxProps } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { flattenObject } from '@milesight/shared/src/utils/tools';
import { InfoOutlinedIcon, LoadingButton, toast } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { useEntity, type InteEntityType } from '../../../hooks';
import Services from './services';
import useFormItems, { AWS_KEYS, type FormDataProps } from './useFormItems';
import './style.less';

interface Props {
    /** 实体列表 */
    entities?: InteEntityType[];

    /** 编辑成功回调 */
    onUpdateSuccess?: () => void;
}

type OpenapiStatusItemType = {
    /** 国际化文案 */
    intlKey: string;
    /** 样式 */
    sx?: SxProps;
};

/**
 * OpenAPI 状态枚举
 */
type OpenapiStatusType = 'READY' | 'NOT_READY' | 'ERROR';

/**
 * 集成配置组件
 */
const Config: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const { blue, green, red } = useTheme();
    const { getEntityKey, getEntityValues } = useEntity({ entities });

    // ---------- 表单相关处理逻辑 ----------
    const formItems = useFormItems();
    const { control, formState, handleSubmit, setValue } = useForm<FormDataProps>();
    const onSubmit: SubmitHandler<FormDataProps> = async params => {
        const finalParams =
            params &&
            Object.entries(flattenObject(params)).reduce(
                (acc, [key, value]) => {
                    const entityKey = getEntityKey(key);

                    if (entityKey && value !== undefined) {
                        entityKey && (acc[entityKey] = value);
                    }
                    return acc;
                },
                {} as Record<string, any>,
            );

        // console.log({ finalParams });
        if (!finalParams || !Object.keys(finalParams).length) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }
        // 提交表单
        const [error, resp] = await awaitWrap(entityAPI.updateProperty({ exchange: finalParams }));
        if (error || !isRequestSuccess(resp)) return;

        onUpdateSuccess?.();
        toast.success({ content: getIntlText('common.message.operation_success') });
    };
    const [openapiStatus, setOpenapiStatus] = useState<OpenapiStatusType>('NOT_READY');
    const openapiStatusMap = useMemo<Record<OpenapiStatusType, OpenapiStatusItemType>>(
        () => ({
            READY: {
                intlKey: getIntlText('setting.integration.api_status_ready'),
                sx: { bgcolor: green[200], color: 'success.main' },
            },
            NOT_READY: {
                intlKey: getIntlText('setting.integration.api_status_waiting'),
                sx: { bgcolor: blue[200], color: 'primary.main' },
            },
            ERROR: {
                intlKey: getIntlText('setting.integration.api_status_error'),
                sx: { bgcolor: red[200], color: 'error.main' },
            },
        }),
        [blue, green, red, getIntlText],
    );

    // 表单数据回填
    useEffect(() => {
        const formData = getEntityValues([
            AWS_KEYS.STATUS,
            AWS_KEYS.SERVER_URL,
            AWS_KEYS.ACCESS_KEY,
            AWS_KEYS.SECRET_KEY,
            AWS_KEYS.WEBHOOK_URL,
            AWS_KEYS.ALARM_URL,
        ]);

        // console.log({ formData });
        setOpenapiStatus(formData[AWS_KEYS.STATUS] || 'NOT_READY');

        setValue(AWS_KEYS.SERVER_URL, formData[AWS_KEYS.SERVER_URL] as never);
        setValue(AWS_KEYS.ACCESS_KEY, formData[AWS_KEYS.ACCESS_KEY] as never);
        setValue(AWS_KEYS.SECRET_KEY, formData[AWS_KEYS.SECRET_KEY] as never);
        setValue(AWS_KEYS.WEBHOOK_URL, formData[AWS_KEYS.WEBHOOK_URL] as never);
        setValue(AWS_KEYS.ALARM_URL, formData[AWS_KEYS.ALARM_URL] as never);
    }, [getEntityValues, setValue]);

    return (
        <>
            <div className="ms-int-config">
                <div className="ms-int-config__header">
                    <h2>{getIntlText('setting.integration.aws_config')}</h2>
                    <Tooltip
                        title={getIntlText('setting.integration.aws_config_helper_text')}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoOutlinedIcon />
                    </Tooltip>
                </div>
                <div className="ms-int-config__body">
                    
                    <div className={cls('form', { loading: formState.isSubmitting })}>
                        {formItems.map(props => (
                            <Controller<FormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <LoadingButton
                        variant="contained"
                        loading={formState.isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        sx={{ mt: 1 }}
                    >
                        {getIntlText('common.button.save')}
                    </LoadingButton>
                </div>
            </div>
            {/* <Services entities={entities} onUpdateSuccess={onUpdateSuccess} /> */}
        </>
    );
};

export default Config;
