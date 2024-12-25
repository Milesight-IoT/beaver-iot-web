import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { flattenObject } from '@milesight/shared/src/utils/tools';
import { checkRequired, checkRangeValue } from '@milesight/shared/src/utils/validators';
import { Modal, type ModalProps } from '@milesight/shared/src/components';

export enum OPENAPI_SCHEDULED_KEYS {
    /** OpenAPI 定时任务 开关 关键字 */
    ENABLED_KEY = 'scheduled_data_fetch.enabled',
    /** OpenAPI 定时任务 周期 实体关键字 */
    PERIOD_KEY = 'scheduled_data_fetch.period',
}

export type OpenapiFormDataProps = Partial<Record<OPENAPI_SCHEDULED_KEYS, string | boolean>>;

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * 弹窗模式
     * @param edit 编辑
     * @param switch 开关
     */
    mode: 'edit' | 'switch';

    /** 表单数据 */
    data?: OpenapiFormDataProps;

    /** 表单提交回调 */
    onSubmit?: (params: OpenapiFormDataProps) => void;
}

/**
 * Openapi 编辑弹窗
 */
const OpenapiModal: React.FC<Props> = ({ mode, data, visible, onCancel, onSubmit }) => {
    const { getIntlText } = useI18n();
    const title = useMemo(() => {
        const subTitle = getIntlText('common.label.openapi');
        switch (mode) {
            case 'edit':
                return getIntlText('common.label.edit_title', { 1: subTitle });
            case 'switch':
                return getIntlText('common.label.enable_title', { 1: subTitle });
            default:
                return '';
        }
    }, [mode, getIntlText]);

    // ---------- 表单数据处理 ----------
    const { control, formState, handleSubmit, reset, setValue } = useForm<OpenapiFormDataProps>();
    const onInnerSubmit: SubmitHandler<OpenapiFormDataProps> = async formData => {
        await onSubmit?.({
            ...flattenObject(formData),
            [OPENAPI_SCHEDULED_KEYS.ENABLED_KEY]: true,
        });
        reset();
    };

    // 填入表单值
    useEffect(() => {
        Object.keys(data || {}).forEach(key => {
            setValue(key as OPENAPI_SCHEDULED_KEYS, data?.[key as OPENAPI_SCHEDULED_KEYS] as never);
        });
    }, [data, setValue]);

    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={() => {
                reset();
                onCancel();
            }}
            onOk={handleSubmit(onInnerSubmit)}
        >
            <Controller<OpenapiFormDataProps>
                name="scheduled_data_fetch.period"
                control={control}
                disabled={formState.isSubmitting}
                rules={{
                    validate: {
                        checkRequired: checkRequired(),
                        checkRangeValue: checkRangeValue({ min: 30, max: 86400 }),
                    },
                }}
                render={({ field: { onChange, value, disabled }, fieldState: { error } }) => {
                    return (
                        <TextField
                            required
                            fullWidth
                            size="small"
                            margin="dense"
                            label={getIntlText('setting.integration.openapi_frequency_of_request')}
                            error={!!error}
                            disabled={disabled}
                            helperText={
                                error
                                    ? error.message
                                    : getIntlText(
                                          'setting.integration.openapi_frequency_helper_text',
                                      )
                            }
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">s</InputAdornment>,
                                },
                            }}
                            value={value}
                            onChange={onChange}
                        />
                    );
                }}
            />
        </Modal>
    );
};

export default OpenapiModal;
