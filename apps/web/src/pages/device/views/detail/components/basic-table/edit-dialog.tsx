import { useEffect } from 'react';
import { TextField } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { checkMaxLength, checkRequired } from '@milesight/shared/src/utils/validators';
import { awaitWrap, deviceAPI, isRequestSuccess, type DeviceAPISchema } from '@/services/http';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** Device details */
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** Edit failure callback */
    onError?: (error?: any) => void;

    /** Edit successful callback */
    onSuccess?: () => void;
}

interface FormDataProps {
    name: string;
}

const EditDialog: React.FC<Props> = ({ data, visible, onCancel, onError, onSuccess }) => {
    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset, setValue } = useForm<FormDataProps>();
    const onSubmit: SubmitHandler<FormDataProps> = async formData => {
        if (!data?.id) return;

        const [error, resp] = await awaitWrap(
            deviceAPI.updateDevice({ id: data.id, name: formData.name }),
        );

        if (error || !isRequestSuccess(resp)) {
            onError?.(error);
            return;
        }

        onSuccess?.();
        toast.success(getIntlText('common.message.operation_success'));
    };

    // Fill/reset the form
    useEffect(() => {
        if (!visible || !data) {
            setTimeout(reset, 100);
            return;
        }

        (Object.keys(data) as (keyof FormDataProps)[]).forEach(key => {
            setValue(key, data[key]);
        });
    }, [data, visible, reset, setValue]);

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('common.label.edit_title', { 1: data?.name })}
            className={cls({ loading: formState.isSubmitting })}
            onCancel={onCancel}
            onOk={handleSubmit(onSubmit)}
        >
            <Controller<FormDataProps>
                name="name"
                control={control}
                rules={{
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 64 }),
                    },
                }}
                render={({ field: { onChange, value, disabled }, fieldState: { error } }) => {
                    return (
                        <TextField
                            required
                            fullWidth
                            size="small"
                            margin="dense"
                            label="Device Name"
                            error={!!error}
                            disabled={disabled}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                }}
            />
        </Modal>
    );
};

export default EditDialog;
