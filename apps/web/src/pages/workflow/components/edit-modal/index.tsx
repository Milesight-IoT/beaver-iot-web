import React from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import useEditFormItems, { type FormDataProps } from './hook/useEditFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** error callback */
    onError?: (err: any) => void;

    /** success callback */
    onSuccess?: (params: FormDataProps) => void;

    /** table-row item */
    data: FormDataProps;
}

/**
 * workflow edit modal
 */
const EditModal: React.FC<Props> = ({ visible, data, onCancel, onError, onSuccess, ...props }) => {
    const { getIntlText } = useI18n();

    // ---------- forms processing ----------
    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>();
    const formItems = useEditFormItems(data);

    const onSubmit: SubmitHandler<FormDataProps> = async ({ ...params }) => {
        reset();
        onSuccess?.(params);
        // TODO: success tips: Save successfully?
        toast.success(getIntlText('common.message.operation_success'));
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    return (
        <Modal
            visible={visible}
            title={getIntlText('common.label.edit_workflow_modal')}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            sx={{ '& .MuiDialog-paper': { width: 600 } }}
            {...props}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default EditModal;
