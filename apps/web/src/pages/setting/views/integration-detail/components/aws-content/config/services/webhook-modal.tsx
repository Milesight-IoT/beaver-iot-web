import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { apiOrigin } from '@milesight/shared/src/config';
import { useI18n, useCopy } from '@milesight/shared/src/hooks';
import { flattenObject, genApiUrl } from '@milesight/shared/src/utils/tools';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { Modal, ContentCopyIcon, type ModalProps } from '@milesight/shared/src/components';

export enum WEBHOOK_KEYS {
    /** Webhook 状态 实体关键字 */
    STATUS = 'webhook_status',
    /** Webhook 开关 实体关键字 */
    ENABLED_KEY = 'webhook.enabled',
    /** Webhook Url 实体关键字 */
    URL_KEY = 'webhook.url',
    /** Webhook 密钥 实体关键字 */
    SECRET_KEY = 'webhook.secret_key',
}

export type WebhookFormDataProps = Partial<Record<WEBHOOK_KEYS, string | boolean>>;

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * 弹窗模式
     * @param edit 编辑
     * @param switch 开关
     */
    mode: 'edit' | 'switch';

    /** 表单数据 */
    data?: WebhookFormDataProps;

    /** 表单提交回调 */
    onSubmit?: (params: WebhookFormDataProps) => void;
}

/**
 * Webhook 地址
 */
export const WEBHOOK_URL = genApiUrl(apiOrigin, '/public/integration/msc/webhook');

/**
 * Webhook 编辑弹窗
 */
const WebhookModal: React.FC<Props> = ({ mode, data, visible, onCancel, onSubmit }) => {
    const { getIntlText } = useI18n();
    const { handleCopy } = useCopy();
    const title = useMemo(() => {
        const subTitle = getIntlText('common.label.webhook');
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
    const { control, formState, handleSubmit, reset, setValue } = useForm<WebhookFormDataProps>();
    const onInnerSubmit: SubmitHandler<WebhookFormDataProps> = async formData => {
        await onSubmit?.({
            ...flattenObject(formData),
            [WEBHOOK_KEYS.ENABLED_KEY]: true,
        });
        reset();
    };

    // 填入表单值
    useEffect(() => {
        Object.keys(data || {}).forEach(key => {
            setValue(key as WEBHOOK_KEYS, data?.[key as WEBHOOK_KEYS] as never);
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
            <div className={cls('ms-inte-service-webhook', { loading: formState.isSubmitting })}>
                <TextField
                    disabled
                    fullWidth
                    size="small"
                    margin="dense"
                    label={getIntlText('setting.integration.webhook_url')}
                    value={WEBHOOK_URL}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => handleCopy(WEBHOOK_URL)}
                                        onMouseDown={(e: any) => e.preventDefault()}
                                        onMouseUp={(e: any) => e.preventDefault()}
                                        edge="end"
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Controller<WebhookFormDataProps>
                    // @ts-ignore
                    defaultValue=""
                    name={WEBHOOK_KEYS.SECRET_KEY}
                    control={control}
                    rules={{
                        validate: { checkRequired: checkRequired() },
                    }}
                    render={({ field: { onChange, value, disabled }, fieldState: { error } }) => {
                        return (
                            <TextField
                                required
                                fullWidth
                                size="small"
                                margin="dense"
                                label={getIntlText('setting.integration.webhook_secret_key')}
                                error={!!error}
                                disabled={disabled}
                                helperText={error ? error.message : null}
                                value={value}
                                onChange={onChange}
                            />
                        );
                    }}
                />
            </div>
        </Modal>
    );
};

export default WebhookModal;
