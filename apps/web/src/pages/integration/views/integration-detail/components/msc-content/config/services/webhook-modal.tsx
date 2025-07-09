import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { apiOrigin } from '@milesight/shared/src/config';
import { useI18n, useCopy } from '@milesight/shared/src/hooks';
import { flattenObject, genApiUrl } from '@milesight/shared/src/utils/tools';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { Modal, ContentCopyIcon, type ModalProps } from '@milesight/shared/src/components';
import { API_PREFIX } from '@/services/http';
import useWebhookUrl from './useWebhookUrl';

export enum WEBHOOK_KEYS {
    /** Webhook status entity keyword */
    STATUS = 'webhook_status',
    /** Webhook Switch entity keyword */
    ENABLED_KEY = 'webhook.enabled',
    /** Webhook Url Entity keyword */
    URL_KEY = 'webhook.url',
    /** Webhook key entity keyword */
    SECRET_KEY = 'webhook.secret_key',
}

export type WebhookFormDataProps = Partial<Record<WEBHOOK_KEYS, string | boolean>>;

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * Popup mode
     * @param edit EDITOR
     * @param switch Switch
     */
    mode: 'edit' | 'switch';

    /** Form data */
    data?: WebhookFormDataProps;

    /** Form submission callback */
    onSubmit?: (params: WebhookFormDataProps) => void;
}

/**
 * Webhook Edit popup
 */
const WebhookModal: React.FC<Props> = ({ mode, data, visible, onCancel, onSubmit }) => {
    const { getIntlText } = useI18n();
    const { handleCopy } = useCopy();
    const webhookUrl = useWebhookUrl();
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

    // ---------- Form data processing ----------
    const { control, formState, handleSubmit, reset, setValue } = useForm<WebhookFormDataProps>();
    const onInnerSubmit: SubmitHandler<WebhookFormDataProps> = async formData => {
        await onSubmit?.({
            ...flattenObject(formData),
            [WEBHOOK_KEYS.ENABLED_KEY]: true,
        });
        reset();
    };

    // Fill in the form values
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
                    value={webhookUrl}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={e => {
                                            handleCopy(webhookUrl, e.currentTarget?.closest('div'));
                                        }}
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
