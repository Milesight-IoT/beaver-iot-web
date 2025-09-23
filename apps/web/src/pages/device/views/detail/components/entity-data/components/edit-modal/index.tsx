import React, { useMemo } from 'react';
import { TextField } from '@mui/material';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { checkRequired, checkMaxLength } from '@milesight/shared/src/utils/validators';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { TableRowDataType } from '../../hooks';

interface IProps extends Omit<ModalProps, 'onOk'> {
    data?: TableRowDataType | null;
    onSuccess?: () => void;
}

type FormDataProps = {
    name: string;
};

/**
 * Entity edit modal
 */
const EditModal: React.FC<IProps> = ({ data, onCancel, onSuccess, ...props }) => {
    const { getIntlText } = useI18n();

    const formItems = useMemo<ControllerProps<FormDataProps>[]>(
        () => [
            {
                name: 'name',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 64 }),
                    },
                },
                defaultValue: data?.entityName,
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('device.label.param_entity_name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        ],
        [data, getIntlText],
    );

    const { control, handleSubmit } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const handleOk: SubmitHandler<FormDataProps> = async params => {
        if (!data) return;
        const [error, resp] = await awaitWrap(
            entityAPI.editEntity({ ...params, id: data.entityId }),
        );

        if (error || !isRequestSuccess(resp)) return;

        onCancel?.();
        onSuccess?.();
        toast.success(getIntlText('common.message.operation_success'));
    };

    return (
        <Modal
            {...props}
            size="lg"
            onOk={handleSubmit(handleOk)}
            onCancel={onCancel}
            title={getIntlText('common.button.edit')}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default EditModal;
