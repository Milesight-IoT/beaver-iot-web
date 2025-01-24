import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { flattenObject } from '@milesight/shared/src/utils/tools';
import { checkRequired, checkRangeValue } from '@milesight/shared/src/utils/validators';
import { Modal, type ModalProps } from '@milesight/shared/src/components';

export enum OPENAPI_SCHEDULED_KEYS {
    /** OpenAPI Scheduled task switch keyword */
    ENABLED_KEY = 'scheduled_data_fetch.enabled',
    /** OpenAPI scheduled task period entity keyword */
    PERIOD_KEY = 'scheduled_data_fetch.period',
}

export type OpenapiFormDataProps = Partial<Record<OPENAPI_SCHEDULED_KEYS, string | boolean>>;

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * Popup mode
     * @param edit EDITOR
     * @param switch Switch
     */
    mode: 'edit' | 'switch';

    /** Form data */
    data?: OpenapiFormDataProps;

    /** Form submission callback */
    onSubmit?: (params: OpenapiFormDataProps) => void;
}

/**
 * Openapi edit popup
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

    // ---------- Form data processing ----------
    const { control, formState, handleSubmit, reset, setValue } = useForm<OpenapiFormDataProps>();
    const onInnerSubmit: SubmitHandler<OpenapiFormDataProps> = async formData => {
        await onSubmit?.({
            ...flattenObject(formData),
            [OPENAPI_SCHEDULED_KEYS.ENABLED_KEY]: true,
        });
        reset();
    };

    // Fill in the form values
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
